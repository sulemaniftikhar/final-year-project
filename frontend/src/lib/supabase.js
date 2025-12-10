import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Customer operations
export const saveCustomer = async (firebaseUid, customerData) => {
    const { data, error } = await supabase
        .from('customers')
        .insert([
            {
                firebase_uid: firebaseUid,
                email: customerData.email,
                full_name: customerData.fullName,
                phone: customerData.phone,
                country_code: customerData.countryCode,
                phone_local: customerData.phoneLocal,
            },
        ])
        .select()

    if (error) throw error
    return data
}

export const getCustomer = async (firebaseUid) => {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
}

// Restaurant operations
export const saveRestaurant = async (firebaseUid, restaurantData) => {
    const { data, error } = await supabase
        .from('restaurants')
        .insert([
            {
                firebase_uid: firebaseUid,
                email: restaurantData.email,
                restaurant_name: restaurantData.restaurantName,
                owner_name: restaurantData.ownerName,
                phone: restaurantData.phone,
                country_code: restaurantData.countryCode,
                phone_local: restaurantData.phoneLocal,
                address: restaurantData.address,
                cuisine: restaurantData.cuisine,
            },
        ])
        .select()

    if (error) throw error
    return data
}

export const getRestaurant = async (firebaseUid) => {
    const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
}