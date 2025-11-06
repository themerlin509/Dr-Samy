import { createClient } from '@supabase/supabase-js'

// FIX: Cast import.meta to 'any' to resolve TypeScript error "Property 'env' does not exist on type 'ImportMeta'". This is a workaround for a missing Vite client types definition.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is not defined. Please check your .env.local file and Vercel environment variables.");
}

/**
 * =================================================================================
 * 🔴 ACTION REQUISE : CONFIGURATION POUR LE DÉPLOIEMENT (VERS VERCEL)
 * =================================================================================
 * Pour que l'authentification (connexion, inscription, reset de mot de passe)
 * fonctionne sur votre site en ligne, vous DEVEZ configurer Supabase.
 *
 * ÉTAPE 1 : Obtenir votre URL de production
 * ---------------------------------------------------------------------------------
 * Une fois votre projet déployé sur Vercel, vous aurez une URL comme :
 * `https://votre-projet-xxxx.vercel.app`
 * Copiez cette URL.
 *
 * ÉTAPE 2 : Configurer les URLs dans Supabase
 * ---------------------------------------------------------------------------------
 * 1. Allez sur votre tableau de bord Supabase : https://supabase.com/dashboard/
 * 2. Allez dans "Authentication" -> "URL Configuration".
 * 3. Dans le champ "Site URL", collez l'URL de votre site Vercel.
 * 4. Dans la section "Redirect URLs", ajoutez également l'URL de votre site Vercel
 *    (ex: `https://votre-projet-xxxx.vercel.app`).
 *    Ceci est crucial pour que la redirection après la réinitialisation du
 *    mot de passe fonctionne.
 * 5. Cliquez sur "Save".
 *
 * =================================================================================
 * ℹ️ NOTE SUR L'AUTHENTIFICATION GOOGLE (si vous la réactivez un jour)
 * =================================================================================
 * Si vous décidez de réintégrer la connexion Google, vous devrez retourner sur
 * la Google Cloud Console (https://console.cloud.google.com/apis/credentials) et
 * ajouter votre URL Vercel dans les "Origines JavaScript autorisées" et les
 * "URIs de redirection autorisés".
 */
export const supabase = createClient(supabaseUrl, supabaseKey);