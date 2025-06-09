import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import AddUser from './add';
import DeleteUser from './delete';
import FindUser from './find';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth, provider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null); // Firebase User
  const [dbUsers, setDbUsers] = useState([]); // Firestore Data

  useEffect(() => {
    // Firestore data fetching
    const fetchUsers = async () => {
      const usersCol = collection(db, 'mydata');
      const userSnapshot = await getDocs(usersCol);
      const userList = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDbUsers(userList);
    };

    // Fetch data on component mount
    fetchUsers();

    // Auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Google login handler
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('ログインエラー:', error);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <Router>
      <Navigation /> {/* Navigation bar */}
      <div className="p-4 flex justify-end bg-gray-100">
        {user ? (
          <div>
            <span className="mr-4">こんにちは、{user.displayName} さん</span>
            <button
              onClick={handleLogout}
              className="p-2 bg-red-500 text-white rounded"
            >
              ログアウト
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="p-2 bg-blue-500 text-white rounded"
          >
            Googleでログイン
          </button>
        )}
      </div>

      <Routes>
        <Route
          path="/"
          element={
            <div>
              <h1>Users from Firestore</h1>
              <table>
                <thead>
                  <tr>
                    <th>id</th>
                    <th>name</th>
                    <th>mail</th>
                    <th>dorm</th>
                  </tr>
                </thead>
                <tbody>
                  {user ? (
                    dbUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b-2 border-gray-400"
                      >
                        <td className="p-4">{user.id}</td>
                        <td className="p-4">{user.name}</td>
                        <td className="p-4">{user.mail}</td>
                        <td className="p-4">
                          {user.dorm ? '寮生' : '通学'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-gray-600 mt-4">
                        ログインするとデータが見られます。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          }
        />
        {user ? (
          <>
            <Route path="/add" element={<AddUser />} />
            <Route path="/delete" element={<DeleteUser />} />
            <Route path="/find" element={<FindUser />} />
          </>
        ) : (
          <>
            <Route
              path="/add"
              element={<p>ログインしてください</p>}
            />
            <Route
              path="/delete"
              element={<p>ログインしてください</p>}
            />
            <Route
              path="/find"
              element={<p>ログインしてください</p>}
            />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
