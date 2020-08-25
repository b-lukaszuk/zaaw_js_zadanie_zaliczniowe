// wpisac w terminal: json-server --watch db.json
// aby uruchomic localhosta
// teraz pod: http://localhost:3000/products mamy liste produktow
let vm = new Vue(
    {
        el: "#app",

        data: {
            
            produkty: null,
            // produkty - wczytane w axiosie (dol skryptu)
            // pola: name (String), model (String), brand (String), price (Float), 
            // description (String), color (String), id (Int), special (Bool)
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
            
        },
    }
);
