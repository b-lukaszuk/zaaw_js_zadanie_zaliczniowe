// wpisac w terminal: json-server --watch db.json
// aby uruchomic localhosta
// teraz pod: http://localhost:3000/products mamy liste produktow
// instalacja za: https://github.com/typicode/json-server

// uwaga: prostsze (i dozwolone) bylo po prostu wklejenie danych do vm.data
// to m.in. wybranie axios-a pociagnelo za soba troche 'gimnastyki'
// i pare nieeleganckich rozwiazan (patrz window.onload na koncu)
// listy produkty, filteredList, produktyOryg

let vm = new Vue(
    {
        el: "#app",

        data: {
            
            produkty: null,
            // produkty - wczytane w axiosie (dol skryptu)
            // pola: name (String), model (String), brand (String), price (Float), 
            // description (String), color (String), id (Int), special (Bool)
            
            // lista przefiltrowanych produktow
            // do stronicowania
            filteredList: null,
            
            // lista pomocnicza do filtrowania po kolorze,
            // cenie, marce 
            produktyOryg: null,
            
            // do stronicowania
            strona: 0,          // aktualnie wybrana strona
            strony: 0,          // liczba wszystkich stron
            
            // do zawezania wyszukiwania po 
            szukanaFraza: "",
            
            // aktywny sort cenowy
            // 3 stany {null | malejaco -> m | rosnaco -> r}
            // potrzebny do utrzymania posortowania cenowego po kliknieciu
            // <a href=?strona=2> 
            // (alternatywa vue router, ale wtedy sporo przerabiania aplikacji,
            // i duzo kodu do dopisania)
            sortPoCenie: "",
            
            // za: https://vuejs.org/v2/guide/forms.html#Checkbox
            wybrKolory: ["red", "black", "cyan"],
            
            // do filtrowania po cenie
            cenaOd: "",
            cenaDo: "",
            
        },

        methods: {
            
            // jakiSort {"m"|"r"}
            ustawSortPoCenie(jakiSort) {
                this.sortPoCenie = jakiSort;
                // zapamietanie sortu
                window.sessionStorage.setItem("sortPoCenie", this.sortPoCenie);
            },
            
            // sortuje inplace
            sortujPoCenieMal() {
                // sort inplace
                this.produktyOryg.sort((a, b) => a.price < b.price);
                // jesli jest wybrany filtr na przeciwnym sortowaniu to go usuwamy
                document.getElementById("cenaSortRos").classList.remove("akt_filtr_cen");
                // i dodajemy klase na te sortowanie
                document.getElementById("cenaSortMal").classList.add("akt_filtr_cen");
            },

            sortujPoCenieRos() {
                // sort inplace
                this.produktyOryg.sort((a, b) => a.price > b.price);
                // jesli jest wybrany filtr na przeciwnym sortowaniu to go usuwamy
                document.getElementById("cenaSortMal").classList.remove("akt_filtr_cen");
                // i dodajemy klase na te sortowanie
                document.getElementById("cenaSortRos").classList.add("akt_filtr_cen");
            },
            
            // makieta_aplikacji.png nie zawiera pola/przycisku typu wyczysc filtrowanie
            // a wiec funkcja zaweza na stale
            // aby miec znowu pelna liste nalezy odswiezyc strone
            szukajPoNazwaMarkaOpis(tmpList = this.produktyOryg) {
                tmpList = tmpList.filter((produkt) => {
                    let czySpelnKryt = false;
                    czySpelnKryt = produkt.name.includes(this.szukanaFraza) ||
                        produkt.brand.includes(this.szukanaFraza) ||
                        produkt.description.includes(this.szukanaFraza);
                    return czySpelnKryt;
                });
                
                // zapamietanie szukanej frazy
                window.sessionStorage.setItem("szukanaFraza", this.szukanaFraza);
                return tmpList;
            },
            
            wybierzKolor(tmpList = this.produktyOryg) {
                tmpList = tmpList.filter((produkt) => {
                    let czySpelnKryt = false;
                    for (let i = 0; i < this.wybrKolory.length; i++) {
                        if(this.wybrKolory[i] === produkt.color) {
                            return true;
                        }
                    }
                    return czySpelnKryt;
                });
                

                // zapamietanie listy kolorow
                window.sessionStorage.setItem("wybrKolory", this.wybrKolory);

                // zwrot listy produktow z danymi kryteriami
                return tmpList;
            },
            
            // filtruje po cenie netto
            filtrujPoCenie(tmpList = this.produktyOryg) {
                let cOd = this.cenaOd;
                let cDo = this.cenaDo;
                
                if(!this.czyObieCenyOK()) {
                    window.alert("CenaOd i/lub CenaDo jest/sa nieprawidlowe(a)" + 
                                "\nNie wykonano operacji filtrowania po cenie");
                } else if(cOd && cDo) { // jesli podano obie ceny
                    tmpList = tmpList.filter((produkt) => {
                        return (produkt.price >= cOd) && (produkt.price <= cDo);
                    });
                } else if(cOd) { // jesli jest tylko cena od
                    tmpList = tmpList.filter((produkt) => {
                        return produkt.price >= cOd;
                    });
                } else if(cDo) { // jesli jest tylko cena do
                    tmpList = tmpList.filter((produkt) => {
                        return produkt.price <= cDo;
                    });
                }
                
                // zapamietanie cenaOd i cenaDo
                window.sessionStorage.setItem("cenaOd", this.cenaOd);
                window.sessionStorage.setItem("cenaDo", this.cenaDo);
                
                return tmpList;
            },
            
            // sprawdza, czy string jest w odpowiednim formacie ceny
            // tj. tylko cyfry i kropki sa dozwolone
            czyFormatCeny(tekst) {
                // sam wpisalem regexa, ale wydaje sie dzialac poprawnie
                return /^\d{1,3}\.{0,1}\d{0,2}$/.test(tekst);
            },
            
            // sprawdza, czy cenaOd < CenaDo
            czyMinLtMax() {
                // jesli ktoras z cen jest nie wpisana zwroc true
                if(!this.cenaOd | !this.cenaDo) {
                    return true;
                }
                return this.cenaOd < this.cenaDo;
            },

            czyObieCenyOK() {
                // sprawdzamy format ceny i to czy zostala wpisana
                return ((this.czyFormatCeny(this.cenaOd) || !this.cenaOd) &&
                        (this.czyFormatCeny(this.cenaDo) || !this.cenaDo) &&
                        this.czyMinLtMax());
            },

            updateFiltrWynikow() {
                console.log("w updateFiltrWynikow");

                // jesli sa sortowania to sortujemy
                if(this.sortPoCenie === "m") {
                    this.sortujPoCenieMal();
                } else if (this.sortPoCenie === "r") {
                    this.sortujPoCenieRos();
                }

                // teraz filtrujemy (odrzucamy to co niepotrzebne)
                // najpierw wczytujemy oryginalna liste produktow
                let tmpList = this.produktyOryg;

                // teraz kolejno sprawdzamy zawezenia/filtrowania listy produktow
                tmpList = this.szukajPoNazwaMarkaOpis(tmpList);
                // jesli szukana fraza jest pusta "" to zwroci wszystko

                tmpList = this.wybierzKolor(tmpList);

                tmpList = this.filtrujPoCenie(tmpList);
                
                // na koniec zwracamy produkty do wyswietlenia
                // nie modyfikujemy oryginalnej listy produktow
                this.produkty = tmpList;
                
            }
        },
        
        
        filters: {
            cenaDoNetto: function(cena) {
                // cena w bazie danych jest w odp formacie
                // nie dajemy wiec Number.toFixed()
                return cena + " zl netto";
            },
            cenaDoBrutto: function(cena) {
                return (cena * 1.23).toFixed(2) + "zl brutto";
            }
        },
        // w dokumnetacji vue.js podaja aby tu dac axios-a
        mounted: function () {

            console.log("w mounted");
            // aby w axiosie przypisac produkty:
            // przez self.produkty, bo nie zadziala samo this.produkty
            self = this;
            axios.get("http://localhost:3000/products")
                .then(function(response) {
                    console.log("axios => wszystko OK");
                    console.log("axios => wczytano products do vm.produkty");
                    self.produkty = response.data;
                    self.produktyOryg = response.data;
                })
                .finally(function() {
                })
                .catch(function(error) {
                    console.log("axios => wystapil jakis blad");
                    console.log("axios => byc moze nie uruchomiles serwera komenda:");
                    console.log("json-server --watch db.json");
                });

        },
        
        created: function() {
            console.log("w created");
        },
        
        // za: https://vuejs.org/v2/guide/computed.html#Watchers
        // oraz sugestia ze stack overflow
        // nie dajemy filteredList w computed (jak na wykladzie), bo musi to pojsc po axiosie
        watch: {
            // whenever produkty changes this function will run
            produkty: function() {
                console.log("w watch produkty");

                // i teraz strony
                this.strony = Math.ceil(this.produkty.length / 4);
                const query = new URLSearchParams(location.search);
                // +query.get("strona") zamienia "1" (String) na 1 (Int)
                this.strona = +query.get("strona");  
                // przy zaladowaniu storny startowej zz.html
                // this.strona to null, musimy wiec to obsluzyc
                this.strona = this.strona ? this.strona : 1;

                // indexy z tablicy produkty (pocz i koniec)
                // do wyswietlenia na danej stronie przy stronicowaniu
                let ind_start = (this.strona - 1) * 4; // inclusive
                let ind_end = ind_start + 4; // exclusive

                // array.slice(start_inclusive, end_exclusive)
                this.filteredList = this.produkty.slice(ind_start, ind_end);
                // 4 bo po produkty na strone
            }
        },

        computed: {
            pierdolka() {console.log("w computed");},
        },
    }
);

window.onload = () => {
    // uruchamia po zaladowaniu strony
    // aby vm zdazyl sie caly utworzyc (a zwlaszcza produkty przez axiosa)
    // damy timeout 200 ms (arbitralne, ale wydaje sie dzialac ok)
    // 200 ms - bo to mniej wiecej najmniejszy czas aby 'swiadomie' cos zobaczyc
    // 200 ms - to zwykle wystarczajaco duzo czasu aby zaladowac vm.produkty
    // tak czy siak rozwiazanie troche kulawe, ale potrzeba mniej kodu niz
    // przy dodaniu vue-router i przerabianiu aplikacji
    setTimeout(() => {
        console.log("po zaladowaniu strony");
        // kodu ponizej nie mozna zamknac w oddzielna funkcje
        // i umiescic jej w watch, bo spowodujemy infinite loop
        
        let ss = window.sessionStorage;
        
        vm.sortPoCenie = ss.getItem("sortPoCenie") || "";
        vm.szukanaFraza = ss.getItem("szukanaFraza") || "";
        
        // wczytywanie kolorow
        if(ss.getItem("wybrKolory")) { // bo null przy 1 odpaleniu strony
            vm.wybrKolory = zwrocTabliceKolorow(ss.getItem("wybrKolory"));
        }
        
        vm.cenaOd = ss.getItem("cenaOd") || "";
        vm.cenaDo = ss.getItem("cenaDo") || "";
        
        vm.updateFiltrWynikow();
        
        // testy
    }, 200);
};


// przyjmuje tekst oddzielony przecinkami, np. "red,black,cyan"
// zwraca kolory w tablicy stringow lub pusta tablice
// bedzie otrzymywac tekst z sessionStorage.getItem("wybrKolory")
function zwrocTabliceKolorow(tekst) {
    if(tekst) { 
        return tekst.split(",");
    } else {
        return [];
    }
}
