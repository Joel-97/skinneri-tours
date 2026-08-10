import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function CalendarView({

  events,

  loading,

  onSelectEvent,

  onSelectSlot

}) {

  if (loading) return null;

  return (

    <Calendar

      localizer={localizer}

      events={events}

      startAccessor="start"

      endAccessor="end"

      selectable

      onSelectEvent={onSelectEvent}

      onSelectSlot={onSelectSlot}

      eventPropGetter={(event) => ({

        style: {

          backgroundColor: event.color,

          borderRadius: "8px",

          color: "#fff",

          border: "none",

          padding: "2px 6px"

        }

      })}

    />

  );

}