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
        },

        methods: {

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
                    console.log("axios => byc moze nie uruchomiles serwera komenda");
                    console.log("json-server --watch db.json");
                });
            console.log(this.produkty);

        },
        
        created: function() {
            console.log("w created");

        },
        
        // za: https://vuejs.org/v2/guide/computed.html#Watchers
        // oraz sugestia ze stack overflow
        // nie dajemy filteredList w computed, bo musi to pojsc po axiosie
        watch: {
            // whenever produkty changes this function will run
            produkty: function() {
                // console.log("zmiana w this.produkty");
                this.filteredList = this.produkty.slice(this.strona * 4, this.strona * 4 + 4);
                // 4 bo po produkty na strone
                
                // i teraz strony
                self.strony = Math.ceil(self.produkty.length / 4);
                const query = new URLSearchParams(location.search);
                console.log(query.get("strona"));
                self.strona = +query.get("strona");  
            }
        },

        computed: {
            pierdolka() {console.log("w computed");},
        },
    }
);
