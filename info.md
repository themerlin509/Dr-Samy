# Guide de Configuration des Variables d'Environnement pour Vercel

Ce guide vous explique comment configurer correctement votre application "Dr Samy" pour qu'elle fonctionne en production sur Vercel. Le problème principal que vous rencontrez (page blanche, erreurs de clé API) est dû à une mauvaise configuration des variables d'environnement.

## Contexte

Votre application a besoin de clés secrètes (clés API) pour communiquer avec les services externes comme Google Gemini et Supabase.

- **En local (`npm run dev`)**: Ces clés sont lues depuis un fichier `.env.local` à la racine de votre projet.
- **En production (sur Vercel)**: Vous ne devez jamais mettre vos clés secrètes dans le code. À la place, vous devez les configurer directement dans les paramètres de votre projet sur le site de Vercel.

Le processus de build (compilation) de votre application prendra ces clés depuis Vercel et les injectera de manière sécurisée dans le code final qui sera servi à vos utilisateurs.

**Important :** Suite aux récentes corrections, toutes les variables d'environnement doivent maintenant être préfixées par `VITE_`. C'est la manière standard et sécurisée de les gérer avec l'outil de build Vite.

## Étapes de Configuration sur Vercel

Suivez ces étapes à la lettre pour que votre déploiement réussisse.

### Étape 1 : Récupérer vos clés API

Assurez-vous d'avoir les 3 clés suivantes :

1.  Votre clé API pour Google Gemini.
2.  L'URL de votre projet Supabase.
3.  La clé `anon public` de votre projet Supabase.

Vous pouvez trouver les clés Supabase dans votre tableau de bord Supabase, sous "Project Settings" > "API".

### Étape 2 : Ajouter les variables à Vercel

1.  Connectez-vous à votre compte Vercel.
2.  Naviguez jusqu'à votre projet "Dr Samy".
3.  Allez dans l'onglet **Settings**.
4.  Dans le menu de gauche, cliquez sur **Environment Variables**.

5.  Ajoutez les trois variables suivantes, une par une. **Faites bien attention au préfixe `VITE_`!**

    | Name                  | Value                               |
    | --------------------- | ----------------------------------- |
    | `VITE_GEMINI_API_KEY` | `collez_votre_clé_gemini_ici`         |
    | `VITE_SUPABASE_URL`   | `collez_votre_url_supabase_ici`       |
    | `VITE_SUPABASE_KEY`   | `collez_votre_clé_publique_supabase_ici` |

    Pour chaque variable :
    - Entrez le nom (ex: `VITE_GEMINI_API_KEY`).
    - Collez la valeur correspondante.
    - Assurez-vous que les environnements (Production, Preview, Development) sont bien cochés.
    - Cliquez sur **Save**.

    ![Exemple de configuration sur Vercel](https://vercel.com/docs/storage/vercel-kv/kv-environment-variables.png)

### Étape 3 : Redéployer votre application

Une fois les variables d'environnement sauvegardées, vous devez déclencher un nouveau déploiement pour que Vercel prenne en compte ces changements.

1.  Allez dans l'onglet **Deployments** de votre projet Vercel.
2.  Cliquez sur le menu "..." à côté de votre dernier déploiement et sélectionnez **Redeploy**.
3.  Décochez l'option "Use existing Build Cache" pour être sûr que Vercel refasse une compilation complète avec les nouvelles variables.
4.  Cliquez sur **Redeploy**.

Attendez la fin du déploiement. Votre application devrait maintenant être fonctionnelle et ne plus afficher de page blanche.
