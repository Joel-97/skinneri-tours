import Button from "../components/general/button";
import { FiEdit2 } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import { AiOutlineSearch } from "react-icons/ai";

function columnsNotifications() {
  var header = [
    {
      name: 'Id',
      selector: row => row?.id,
      sortable: true,
      omit: true
    },
    {
      name: 'Category',
      selector: row => row?.category,
      sortable: true,
    },
    {
      name: 'Summary',
      selector: row => row?.summary,
      sortable: true,
    },
    {
      name: 'Time',
      selector: row => row?.time,
      sortable: true,
    },
  ]
  return header;
}

function numtoDate(numDates, isTrue = true) {
  var to1900 = isTrue ? 25567 + 1 : 25567;
  // 86400 is the number of seconds in a day, so we multiply by 1000 to get milliseconds.
  return new Date((numDates - to1900) * 86400 * 1000);
}

const monthNames = [
  "January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"
];

const dayOfWeekNames = [
  "Sunday", "Monday", "Tuesday",
  "Wednesday", "Thursday", "Friday", "Saturday"
];

// function formatDate(date, patternStr) {
//   try {
//     if (!patternStr) {
//       patternStr = 'yyyy-MM-dd';
//     }
//     var day = date.getDate(),
//       month = date.getMonth(),
//       year = date.getFullYear(),
//       hour = date.getHours(),
//       minute = date.getMinutes(),
//       second = date.getSeconds(),
//       miliseconds = date.getMilliseconds(),
//       h = hour % 12,
//       hh = twoDigitPad(h),
//       HH = twoDigitPad(hour),
//       mm = twoDigitPad(minute),
//       ss = twoDigitPad(second),
//       aaa = hour < 12 ? 'AM' : 'PM',
//       EEEE = dayOfWeekNames[date.getDay()],
//       EEE = EEEE.substr(0, 3),
//       dd = twoDigitPad(day),
//       M = month + 1,
//       MM = twoDigitPad(M),
//       MMMM = monthNames[month],
//       MMM = MMMM.substr(0, 3),
//       yyyy = year + "",
//       yy = yyyy.substr(2, 2)
//       ;
//     // checks to see if month name will be used
//     patternStr = patternStr
//       .replace('hh', hh).replace('h', h)
//       .replace('HH', HH).replace('H', hour)
//       .replace('mm', mm).replace('m', minute)
//       .replace('ss', ss).replace('s', second)
//       .replace('S', miliseconds)
//       .replace('dd', dd).replace('d', day)

//       .replace('EEEE', EEEE).replace('EEE', EEE)
//       .replace('yyyy', yyyy)
//       .replace('yy', yy)
//       .replace('aaa', aaa);
//     if (patternStr.indexOf('MMM') > -1) {
//       patternStr = patternStr
//         .replace('MMMM', MMMM)
//         .replace('MMM', MMM);
//     }
//     else {
//       patternStr = patternStr
//         .replace('MM', MM)
//         .replace('M', M);
//     }

//     return patternStr;
//   } catch (error) {

//   }
// }

function twoDigitPad(num) {
  return num < 10 ? "0" + num : num;
}

  /* =============================================================== 
  * SE UTILIZA PARA OBTENER LA FECHA FINAL
  * Genera la fecha final (endDate) a partir de la fecha inicial y la duración en minutos. 
  =============================================================== */

  const getEndDate = (startDate, durationMinutes) => {

    const start = new Date(startDate);

    const end = new Date(
      start.getTime() + durationMinutes * 60000
    );

    const formattedEnd =
      end.getFullYear() +
      "-" +
      String(end.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(end.getDate()).padStart(2, "0") +
      "T" +
      String(end.getHours()).padStart(2, "0") +
      ":" +
      String(end.getMinutes()).padStart(2, "0");

    return formattedEnd;
  };

  /* =============================================================== 
  * GENERADOR DE NÚMERO DE RESERVA (MULTI-CATEGORÍA)
  =============================================================== */

  const generateReservationNumber = (category = "transportation") => {

    const now = new Date();

    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const random = Math.floor(10000 + Math.random() * 90000);
    const extra = Date.now().toString().slice(-2); // 2 dígitos extra

    // 🔥 Prefijo dinámico
    let prefix = "TR"; // default

    if (category === "adventure") {
      prefix = "AD";
    } else if (category === "transportation") {
      prefix = "TR";
    }

    return `${prefix}-${day}${month}-${random}${extra}`;
  };

  /* =============================================================== 
  * FORMATEAR LA FECHA PARA QUE SE VEA DD/MM/YYYY
  =============================================================== */
  const formatDateCustom = (dateStr) => {
    if (!dateStr) return "-";

    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };


  /* =============================================================== 
  * A LOS NUMEROS LES PONE SOLO DOS DECIMALES
  =============================================================== */
  
  const safe = (value) => Number(value || 0).toFixed(2);


export { numtoDate, monthNames, dayOfWeekNames, formatDateCustom, twoDigitPad, columnsNotifications, getEndDate, generateReservationNumber, safe}

  export const roleVisit = 'visit';
  export const roleSuperAdmin = 'superAdmin';
