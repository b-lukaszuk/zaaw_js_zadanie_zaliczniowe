// wpisac w terminal: json-server --watch db.json
// aby uruchomic localhosta
// teraz pod: http://localhost:3000/products mamy liste produktow
// instalacja za: https://github.com/typicode/json-server
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
            
            strona: 0,
            strony: 0,
            nazwa_lub_model_prod: "",
        },

        methods: {
            // sortuje inplace
            sortujPoCenieMal() {
                this.produkty.sort((a, b) => a.price < b.price);
                // jesli jest wybrany filtr na przeciwnym sortowaniu to go usuwamy
                document.getElementById("cenaSortRos").classList.remove("akt_filtr_cen");
                // i dodajemy klase na te sortowanie
                document.getElementById("cenaSortMal").classList.add("akt_filtr_cen");
            },

            sortujPoCenieRos() {
                this.produkty.sort((a, b) => a.price > b.price);
                // jesli jest wybrany filtr na przeciwnym sortowaniu to go usuwamy
                document.getElementById("cenaSortMal").classList.remove("akt_filtr_cen");
                // i dodajemy klase na te sortowanie
                document.getElementById("cenaSortRos").classList.add("akt_filtr_cen");
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

                let ind_start = (this.strona - 1) * 4;
                let ind_end = ind_start + 4;
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

