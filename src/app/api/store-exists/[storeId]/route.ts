
import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, limit } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

/**
 * API route to check if a store with a given storeId exists.
 * @param request - The incoming NextRequest.
 * @param params - The route parameters, containing the storeId.
 * @returns A NextResponse with JSON indicating if the store exists.
 */
export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const storeId = params.storeId;
    if (!storeId) {
      return NextResponse.json({ exists: false, error: 'Store ID is required' }, { status: 400 });
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('storeId', '==', storeId), limit(1));
    const querySnapshot = await getDocs(q);

    const exists = !querySnapshot.empty;

    return NextResponse.json({ exists });
  } catch (error) {
    console.error('Error checking for store existence:', error);
    return NextResponse.json({ exists: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
