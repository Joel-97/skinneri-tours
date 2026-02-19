import React, { useEffect, useState } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate, useParams } from 'react-router-dom';
import CalendarAdventures from '../components/calendars/calendarAdventures';
import Activities from '../components/bookingTable/adventures/tableConfig';
import Adventures from '../components/bookingTable/adventures/tableConfig';
import Rentals from '../components/bookingTable/rentals/tableConfig';
import { auth } from '../firebase';
import '../style/booking.css';
import '../style/style.css';
import Accordion from 'react-bootstrap/Accordion';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { getClientReservations } from '../services/ConfigReservations';
import { getData } from "../services/crm/clients";

const idRole = 'adventures';

const Bookings = () => {

    const navigate = useNavigate();
    const [user, loading] = useAuthState(auth);
    const [reservationData, setReservationData ] = useState({rows: []});
    const [pendingReser, setPendingReser] = useState(true);

    const [clientListAux, setClientListAux] = useState({ rows: [] });

    let { tap } = useParams();

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const defaultTabIndex = token || tap?.length === 0 ? 0 : tap?.length === 1 ? 1 : tap;
    const initialTap = tap && tap.length > 1 ? tap : 1;

    useEffect(() => {
        if (loading) {
          // setTimeout(() => {
          //   if (tap) {
          //     getClientReservations(tap, setReservationData, setPendingReser);
          //   }
          // }, 300);

          return;
        }
        if (!user) navigate("/signin");
      }, [user, loading]);

    useEffect(() => {
      if (user != null) {

        if(clientListAux?.rows?.length < 1 && defaultTabIndex === 0){
          getData(setClientListAux);
        }
        
      }
    }, [user]);

 

    return (
      <div className="container-dashboard">
        <div className='row'>
          <div className='col-12'>
              <Tabs defaultIndex={defaultTabIndex === 0 ? 0 : 1 }>
                <TabList> 
                  <Tab>Dashboard</Tab>
                  <Tab>Adventures</Tab>
                </TabList>

                <TabPanel>
                  <CalendarAdventures clients={clientListAux}></CalendarAdventures>
                </TabPanel>
                <TabPanel>
                  <Adventures tap={initialTap} clients={clientListAux}></Adventures>
                </TabPanel>
              
              </Tabs>
          </div>
        </div>
      </div>
      )
    }
    
export default Bookings