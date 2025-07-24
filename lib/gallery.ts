import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { GalleryImage } from './types';

const GALLERY_COLLECTION = 'gallery';

export const addGalleryImage = async (imageData: Omit<GalleryImage, 'id' | 'createdAt'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, GALLERY_COLLECTION), {
            ...imageData,
            createdAt: new Date()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding gallery image:', error);
        throw error;
    }
};

export const getGalleryImages = async (): Promise<GalleryImage[]> => {
    try {
        const q = query(collection(db, GALLERY_COLLECTION), orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as GalleryImage[];
    } catch (error) {
        console.error('Error getting gallery images:', error);
        throw error;
    }
};

export const updateGalleryImage = async (id: string, imageData: Partial<GalleryImage>): Promise<void> => {
    try {
        const docRef = doc(db, GALLERY_COLLECTION, id);
        await updateDoc(docRef, imageData);
    } catch (error) {
        console.error('Error updating gallery image:', error);
        throw error;
    }
};

export const deleteGalleryImage = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, GALLERY_COLLECTION, id));
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        throw error;
    }
};

export const updateGalleryOrder = async (imageIds: string[]): Promise<void> => {
    try {
        const updatePromises = imageIds.map((id, index) => {
            const docRef = doc(db, GALLERY_COLLECTION, id);
            return updateDoc(docRef, { order: index });
        });

        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error updating gallery order:', error);
        throw error;
    }
}; 