// 'use client';

// import React, { useState, useEffect } from 'react';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from './firebaseConfig'; // Adjust the import path as needed

// export default function SimpleTest() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     async function fetchData() {
//       try {
        
//         const querySnapshot = await getDocs(collection(db, "players"));
//         const docs = [];
//         querySnapshot.forEach((doc) => {
//           docs.push({ id: doc.id, ...doc.data() });
//         });
//         console.log('Fetched Documents:', docs);
//         setData(docs);
//       } catch (err) {
//         console.error('Error fetching documents:', err);
//         setError('Failed to fetch data. Check console for details.');
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchData();
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div>
//       <h1>Firestore Data</h1>
//       <button onClick={() => window.location.reload()}>Refresh</button>
//       <pre>{JSON.stringify(data, null, 2)}</pre>
//     </div>
//   );
// }

