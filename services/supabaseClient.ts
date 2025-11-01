import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqpzhpcglfbydcwgqdsu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxcHpocGNnbGZieWRjd2dxZHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Njc3MTksImV4cCI6MjA3NzQ0MzcxOX0.XMH8J8QzayRL48TCThYBtPweeDPSOw_IuFWxPJfrK9g';

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is not defined.");
}

/**
 * =================================================================================
 * 🔴 ACTION REQUISE : CONFIGURATION DE L'AUTHENTIFICATION GOOGLE
 * =================================================================================
 * Pour que la connexion avec Google fonctionne, vous DEVEZ suivre ces étapes.
 * L'erreur "accounts.google.com refused to connect" est due à une mauvaise configuration ici.
 *
 * Documentation de référence : https://supabase.com/docs/guides/auth/social-login/auth-google
 *
 * ÉTAPE 1 : Activer le fournisseur Google dans Supabase
 * ---------------------------------------------------------------------------------
 * 1. Allez sur votre tableau de bord Supabase : https://supabase.com/dashboard/
 * 2. Sélectionnez votre projet.
 * 3. Allez dans "Authentication" -> "Providers".
 * 4. Trouvez "Google" dans la liste et activez-le. Vous y trouverez une "Redirect URL" (ou "Callback URL"). Copiez-la pour l'étape suivante.
 *    Elle ressemblera à : `https://dqpzhpcglfbydcwgqdsu.supabase.co/auth/v1/callback`
 *
 * ÉTAPE 2 : Créer et Configurer les Clés d'Identification Google OAuth
 * ---------------------------------------------------------------------------------
 * 1. Allez sur la Google Cloud Console : https://console.cloud.google.com/apis/credentials
 * 2. Créez un nouvel "ID client OAuth 2.0".
 * 3. Choisissez "Application web" comme type d'application.
 * 4. Dans la section "Origines JavaScript autorisées" (Authorized JavaScript origins) :
 *    - **C'EST L'ÉTAPE LA PLUS IMPORTANTE POUR CORRIGER VOTRE ERREUR.**
 *    - Vous devez ajouter l'URL EXACTE où votre application est exécutée.
 *    - Si vous développez en local, ajoutez `http://localhost:3000` (ou le port que vous utilisez).
 *    - Si vous utilisez un IDE en ligne ou un service de déploiement, ajoutez l'URL de base de votre application (par ex. `https://mon-app-xxxx.web.app`).
 * 5. Dans la section "URIs de redirection autorisés" (Authorized redirect URIs) :
 *    - Ajoutez l'URL que vous avez copiée de Supabase à l'étape 1.
 * 6. Cliquez sur "Créer". Une fenêtre apparaîtra avec votre "ID client" et votre "Code secret du client".
 *
 * ÉTAPE 3 : Configurer les clés dans Supabase
 * ---------------------------------------------------------------------------------
 * 1. Retournez aux paramètres du fournisseur Google dans votre tableau de bord Supabase.
 * 2. Copiez l'"ID client" depuis la Google Cloud Console et collez-le dans le champ "Client ID" de Supabase.
 * 3. Copiez le "Code secret du client" et collez-le dans le champ "Client Secret" de Supabase.
 * 4. Cliquez sur "Save".
 *
 * =================================================================================
 */
export const supabase = createClient(supabaseUrl, supabaseKey);