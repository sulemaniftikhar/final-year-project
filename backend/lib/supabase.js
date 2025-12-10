import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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

    if (error) throw error
    return data
}

export const updateCustomer = async (firebaseUid, updates) => {
    const { data, error } = await supabase
        .from('customers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('firebase_uid', firebaseUid)
        .select()

    if (error) throw error
    return data
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

    if (error) throw error
    return data
}

export const updateRestaurant = async (firebaseUid, updates) => {
    const { data, error } = await supabase
        .from('restaurants')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('firebase_uid', firebaseUid)
        .select()

    if (error) throw error
    return data
}