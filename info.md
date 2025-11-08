# Guide de Déploiement et Configuration pour Vercel

Ce guide vous explique comment configurer et déployer correctement votre application "Dr Samy" sur Vercel. Les étapes ci-dessous résolvent les problèmes de page blanche et d'erreurs d'API en mettant en place une architecture sécurisée et robuste.

## Architecture et Sécurité des Clés API

Pour des raisons de sécurité, les clés API "secrètes" (comme celle de Gemini) ne doivent **jamais** être exposées dans le code côté client (navigateur). Pour cette raison, l'application a été restructurée :

1.  **Appels Gemini (côté serveur)** : Un proxy sécurisé (une fonction "serverless") a été créé dans le dossier `/api`. C'est cette fonction, qui s'exécute sur les serveurs de Vercel, qui détient la clé secrète `API_KEY` et communique avec Google Gemini. Votre application n'expose jamais cette clé.
2.  **Configuration Supabase (côté client)** : Les clés pour Supabase (`VITE_SUPABASE_URL` et `VITE_SUPABASE_KEY`) sont publiques et peuvent être chargées en toute sécurité dans l'application. Le préfixe `VITE_` est une convention de l'outil de build (Vite) pour les rendre accessibles.

## Variables d'Environnement à Configurer

Vous devrez configurer les trois variables suivantes dans les paramètres de votre projet Vercel :

| Nom de la Variable      | Description                                       | Type     |
| ----------------------- | ------------------------------------------------- | -------- |
| `API_KEY`               | Votre clé API secrète pour Google Gemini.         | Secrète  |
| `VITE_SUPABASE_URL`     | L'URL de votre projet Supabase.                   | Publique |
| `VITE_SUPABASE_KEY`     | Votre clé publique "anon" de Supabase.            | Publique |

## Étapes de Configuration sur Vercel

Suivez ces étapes à la lettre pour que votre déploiement réussisse.

### Étape 1 : Ajouter les variables à Vercel

1.  Connectez-vous à votre compte Vercel et naviguez jusqu'à votre projet.
2.  Allez dans l'onglet **Settings**.
3.  Dans le menu de gauche, cliquez sur **Environment Variables**.
4.  Ajoutez les trois variables listées dans le tableau ci-dessus, une par une.
    - Entrez le nom (ex: `API_KEY`).
    - Collez la valeur correspondante.
    - Assurez-vous que tous les environnements (Production, Preview, Development) sont cochés.
    - Cliquez sur **Save**.

    ![Exemple de configuration sur Vercel](https://vercel.com/docs/storage/vercel-kv/kv-environment-variables.png)

### Étape 2 : Vérifier les Paramètres de Build

Vercel détecte généralement la configuration automatiquement, mais il est bon de vérifier :

1.  Toujours dans **Settings**, allez dans **General**.
2.  Assurez-vous que les "Build & Development Settings" sont configurés comme suit :
    - **Framework Preset**: `Vite`
    - **Build Command**: `npm run build` ou `vite build`
    - **Output Directory**: `dist`
    - **Install Command**: `npm install`

### Étape 3 : Redéployer l'Application

Une fois les variables sauvegardées et les paramètres vérifiés, vous devez déclencher un nouveau déploiement.

1.  Allez dans l'onglet **Deployments** de votre projet Vercel.
2.  Cliquez sur le menu "..." à côté de votre dernier déploiement et sélectionnez **Redeploy**.
3.  **Important** : Décochez l'option "Use existing Build Cache" pour forcer Vercel à utiliser les nouvelles variables d'environnement.
4.  Cliquez sur **Redeploy**.

Après quelques minutes, votre déploiement sera terminé. Votre application devrait maintenant être parfaitement fonctionnelle, sécurisée et accessible à l'URL fournie par Vercel.
