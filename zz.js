// wpisac w terminal: json-server --watch db.json
// aby uruchomic localhosta
// teraz pod: http://localhost:3000/products mamy liste produktow
// instalacja za: https://github.com/typicode/json-server

// uwaga: prostsze (i dozwolone) bylo po prostu wklejenie danych do vm.data
// to m.in. wybranie axios-a pociagnelo za soba troche 'gimnastyki'
// i pare nieeleganckich rozwiazan (patrz window.onload na koncu)

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
            
            // do stronicowania
            strona: 0,          // aktualnie wybrana strona
            strony: 0,          // liczba wszystkich stron
            
            // do zawezania wyszukiwania
            nazwa_lub_model_prod: "",
            
            // aktywny filtr cenowy
            // 3 stany {null|rosnaco|malejaco}
            // potrzebny do utrzymania posortowania cenowego po kliknieciu
            // <a href=?strona=2> 
            // (alternatywa vue router, ale wtedy sporo przerabiania aplikacji,
            // i duzo kodu do dopisania)
            filtrCenowy: null,
            
        },

        methods: {
            // sortuje inplace
            sortujPoCenieMal() {
                this.produkty.sort((a, b) => a.price < b.price);
                // jesli jest wybrany filtr na przeciwnym sortowaniu to go usuwamy
                document.getElementById("cenaSortRos").classList.remove("akt_filtr_cen");
                // i dodajemy klase na te sortowanie
                document.getElementById("cenaSortMal").classList.add("akt_filtr_cen");
                this.filtrCenowy = "malejaco";
                // zapamietanie filtra
                window.sessionStorage.setItem("filtrCenowy", this.filtrCenowy);
            },

            sortujPoCenieRos() {
                this.produkty.sort((a, b) => a.price > b.price);
                // jesli jest wybrany filtr na przeciwnym sortowaniu to go usuwamy
                document.getElementById("cenaSortMal").classList.remove("akt_filtr_cen");
                // i dodajemy klase na te sortowanie
                document.getElementById("cenaSortRos").classList.add("akt_filtr_cen");
                this.filtrCenowy = "rosnaco";
                window.sessionStorage.setItem("filtrCenowy", this.filtrCenowy);
            },
            
            szukajPoKryteriach() {
                console.log("szukam po kryteriach");
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
        
        // sprawdzamy czy ostatnio byl filtr cenowy jesli tak to go przywracamy
        // potrzebne przy klikaniu <a href=?strona=2> przy stronicowaniu
        let ostFiltrCenowy = window.sessionStorage.getItem("filtrCenowy");
        if(ostFiltrCenowy === "rosnaco") {
            vm.sortujPoCenieRos();
        } else if (ostFiltrCenowy === "malejaco") {
            vm.sortujPoCenieRos();
        }
    }, 200);
};

