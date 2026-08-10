import React, { useEffect, useState } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import '../style/home.css';
import '../style/style.css';
import Table from "../components/clients/tableClient";
import { getDataOneUser } from '../services/auth/users';
import { roleVisit } from "../services/Tools";
import Loading from "../components/loading";

const idRole = 'clients';

const Clients = () => {
    
    const navigate = useNavigate();
    const [user, loading] = useAuthState(auth);
    const [userInfo, setUserInfo ] = useState('');
    const [showLoading, setShowLoading] = useState(true);

    useEffect(() => {
        if (loading) {
          // maybe trigger a loading screen
          return;
        }
        //if (!user) navigate("/signin");
        if (user != null) {
          const getUserData = async () => {
            try {
              const userDocSnap = await getDataOneUser(user.uid);
              if (userDocSnap?.length > 0) {
                const userRole = userDocSnap[0]?.role;
                if (userRole !== roleVisit) {
                  setShowLoading(false);
                  setUserInfo(userDocSnap[0]);
                } else {
                  localStorage.setItem('errorMessage', 'We are sorry but you do not have access to these system functions.');
                  window.location.href = '/home';
                }
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
              // Manejar el error apropiadamente, por ejemplo, mostrar un mensaje de error al usuario
            }
          };
      
          getUserData();
        } else {
          navigate("/signin");
        }

      }, [user, loading]);

    return (
      <div className="container-dashboard">
        { showLoading ? (
        <>
          <div style={{textAlign:"center"}}>
            <Loading></Loading>
          </div>
        </>
        ) 
        : (
        <>
            <Table></Table>
        </>
        )}
        </div>
      )
    }
    
export default Clients