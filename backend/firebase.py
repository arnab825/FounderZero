import os
import json
import logging
from typing import Dict, Any, Optional, List
from config import settings

logger = logging.getLogger("autonomous_co_founder.firebase")

# Mock In-Memory Store for fallback when Firebase credentials are not provided
class MockFirestoreCollection:
    def __init__(self, name: str, db: "MockFirestore"):
        self.name = name
        self.db = db

    def document(self, doc_id: str) -> "MockFirestoreDoc":
        return MockFirestoreDoc(self.name, doc_id, self.db)

    def stream(self):
        docs = self.db._store.get(self.name, {})
        for doc_id, data in docs.items():
            yield MockDocumentSnapshot(doc_id, data)


class MockDocumentSnapshot:
    def __init__(self, doc_id: str, data: Dict[str, Any]):
        self.id = doc_id
        self._data = data

    def to_dict(self) -> Dict[str, Any]:
        return self._data.copy()

    @property
    def exists(self) -> bool:
        return bool(self._data)


class MockFirestoreDoc:
    def __init__(self, collection: str, doc_id: str, db: "MockFirestore"):
        self.collection = collection
        self.doc_id = doc_id
        self.db = db

    def set(self, data: Dict[str, Any], merge: bool = False):
        if self.collection not in self.db._store:
            self.db._store[self.collection] = {}
        if merge and self.doc_id in self.db._store[self.collection]:
            self.db._store[self.collection][self.doc_id].update(data)
        else:
            self.db._store[self.collection][self.doc_id] = data.copy()

    def update(self, data: Dict[str, Any]):
        if self.collection in self.db._store and self.doc_id in self.db._store[self.collection]:
            self.db._store[self.collection][self.doc_id].update(data)
        else:
            self.set(data)

    def get(self) -> MockDocumentSnapshot:
        data = self.db._store.get(self.collection, {}).get(self.doc_id, {})
        return MockDocumentSnapshot(self.doc_id, data)

    def delete(self):
        if self.collection in self.db._store and self.doc_id in self.db._store[self.collection]:
            del self.db._store[self.collection][self.doc_id]


class MockFirestore:
    def __init__(self):
        self._store: Dict[str, Dict[str, Dict[str, Any]]] = {}

    def collection(self, name: str) -> MockFirestoreCollection:
        return MockFirestoreCollection(name, self)


# Initialize Firebase Admin or Fallback
firebase_app = None
firestore_client = None
is_firebase_initialized = False

try:
    import firebase_admin
    from firebase_admin import credentials, firestore, auth

    cred_path = settings.FIREBASE_CREDENTIALS_PATH
    if cred_path:
        # Check direct path, relative to backend, or relative to root
        possible_paths = [
            cred_path,
            os.path.join(os.path.dirname(__file__), cred_path),
            os.path.join(os.path.dirname(__file__), "..", cred_path)
        ]
        resolved_path = next((p for p in possible_paths if os.path.exists(p)), None)
        
        if resolved_path:
            cred = credentials.Certificate(resolved_path)
            firebase_app = firebase_admin.initialize_app(cred)
            firestore_client = firestore.client()
            is_firebase_initialized = True
            logger.info(f"Firebase Admin initialized via service account file at: {resolved_path}")
        else:
            logger.warning(f"Firebase service account file not found at: {cred_path}")
    elif settings.FIREBASE_PROJECT_ID and settings.FIREBASE_CLIENT_EMAIL and settings.FIREBASE_PRIVATE_KEY:
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": settings.FIREBASE_PROJECT_ID,
            "private_key": settings.FIREBASE_PRIVATE_KEY.replace('\\n', '\n'),
            "client_email": settings.FIREBASE_CLIENT_EMAIL,
            "token_uri": "https://oauth2.googleapis.com/token"
        })
        firebase_app = firebase_admin.initialize_app(cred)
        firestore_client = firestore.client()
        is_firebase_initialized = True
        logger.info("Firebase Admin initialized via environment credentials.")
    else:
        logger.warning("No Firebase credentials provided. Falling back to local in-memory Firestore client.")
        firestore_client = MockFirestore()
except Exception as e:
    logger.warning(f"Failed to initialize Firebase Admin SDK: {e}. Using MockFirestore fallback.")
    firestore_client = MockFirestore()


def get_db():
    """Returns the Firestore DB client (real or mock)."""
    return firestore_client


def verify_firebase_token(id_token: str) -> Optional[Dict[str, Any]]:
    """Verifies a Firebase Auth ID Token. In mock mode, returns a mock user payload."""
    if not id_token:
        return None
    
    if is_firebase_initialized:
        try:
            from firebase_admin import auth
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            logger.error(f"Error verifying Firebase token: {e}")
            return None
    else:
        # Development / Mock auth verification
        return {
            "uid": "demo-user-123",
            "email": "founder@example.com",
            "name": "Alex Founder",
            "picture": "https://api.dicebear.com/7.x/bottts/svg?seed=founder"
        }
