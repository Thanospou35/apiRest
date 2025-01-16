const express = require("express");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: "./config/.env" });
const User = require('./models/user'); // Assurez-vous que le modèle User est bien défini

const app = express();

// Middleware pour parser les données JSON et `x-www-form-urlencoded`
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async function() {
    try {
        // Vérification si la variable MONGO_URI est bien définie
        if (!process.env.MONGO_URI) {
            throw new Error('La variable MONGO_URI n\'est pas définie dans le fichier .env');
        }

        // Connexion à MongoDB avec MONGO_URI
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connexion réussie avec succès');


        //Routes get
        app.get("/users", async (req, res) => {
            try {
                const users = await User.find();
                res.json(users)
            } catch (error) {
                res.json({message: error.message});
            }
        }); 

        //Pour afficher en utilisant l'ID
        app.get("/users/:id", async (req, res) => {
            try {
                //Recherche de l'utilisateur par son ID
                const user = await User.findById(req.params.id);

                //Si l'utilisateur est trouvé, retourné-le
                if (!user) {
                    return res.json({message: "Utilisateur non trouvé"});
                }
                res.status(200).json(user);
            } catch (error) {
                //Si l'ID est invalide ou autre erreur
                res.status(400).json({
                    message: "Erreur lors de la récupération de l'utilisateur",
                    error: error.message,
                });
            }
        })



        // Définir la route POST pour /users
        app.post("/users", async (req, res) => {
            const { name, email, age } = req.body;
            try {
                const newUser = new User({ name, email, age });
                const savedUser = await newUser.save(); // Enregistrer l'utilisateur
                res.status(201).json({ message: 'Utilisateur créé avec succès', data: savedUser });
            } catch (err) {
                res.status(400).json({ message: err.message });
            }
        });
    } catch (error) {
        console.log('Erreur de connexion ou d\'enregistrement :', error.message);
        process.exit(1); // Arrête le serveur si la connexion échoue
    }



    //Methode pour modifier 
    app.put("/users/:id", async (req, res) => {
        try {
            const updateUser = await User.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                }
            );
            res.status(200).json(updateUser);
        } catch (error) {
            res.status(400).json({message: error.message});
        }
    });



    //Methode pour supprimer appartir de l'id
    app.delete("/users/:id", async (req, res) => {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json({message: "Utilisateur supprimé avec succés"});
        } catch (error) {
            res.status(400).json({message: error.message})
        }
    })
})();



// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur en cours sur le port ${PORT}`);
});
