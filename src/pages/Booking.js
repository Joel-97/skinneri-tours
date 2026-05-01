import React from 'react';
import { useParams } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

import '../style/booking.css';
import '../style/style.css';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import CalendarTransportations from '../components/calendars/calendarTransportation';
import TransportationList from '../components/reservations/transportation/transportationList';

const Bookings = () => {

    const { tap } = useParams();
    const { companyId, user } = UserAuth();

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const defaultTabIndex =
        token || !tap
            ? 0
            : tap.length === 1
            ? 1
            : parseInt(tap, 10) || 0;

    return (
        <div className="container-dashboard">
            <div className='row'>
                <div className='col-12'>

                    <Tabs defaultIndex={defaultTabIndex === 0 ? 0 : 1}>

                        <TabList>
                            <Tab>Calendario</Tab>
                            <Tab>Lista de transportes</Tab>
                        </TabList>

                        <TabPanel>
                            <CalendarTransportations companyId={companyId} user={user} />
                        </TabPanel>

                        <TabPanel>
                            <TransportationList companyId={companyId} user={user}/>
                        </TabPanel>

                    </Tabs>

                </div>
            </div>
        </div>
    );
};

export default Bookings;
