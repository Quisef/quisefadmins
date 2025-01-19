// app/api/blogs/[id]/route.js
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../app/lib/firebase';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'blogs', id));

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}