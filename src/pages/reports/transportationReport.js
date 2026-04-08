import React, { useEffect, useState, useMemo } from "react";
import {
  getTransportation
} from "../../services/transportation/transportationService";

import { notifyError } from "../../services/notificationService";
import Loading from "../../components/general/loading";
import "../../style/reports/transportationReport.css";

const TransportationReport = ({ companyId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔎 filtros
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  // 📥 cargar datos
  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getTransportation(companyId);
      setBookings(data || []);
    } catch (error) {
      notifyError("Error cargando reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [companyId]);

  // 🔧 helpers fecha
  const toDate = (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp.seconds * 1000);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.seconds * 1000);
    return date.toISOString().split("T")[0];
  };

  // 🔹 opciones dinámicas
  const driverOptions = useMemo(() => {
    const unique = [...new Set(bookings.map(b => b.driverName).filter(Boolean))];
    return unique;
  }, [bookings]);

  const paymentOptions = useMemo(() => {
    const unique = [...new Set(bookings.map(b => b.paymentTypeName).filter(Boolean))];
    return unique;
  }, [bookings]);

  // 🔎 filtrado
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const bookingDate = toDate(b.date);

      const matchesDate =
        (!startDateFilter || bookingDate >= new Date(startDateFilter)) &&
        (!endDateFilter || bookingDate <= new Date(endDateFilter));

      const matchesSearch =
        !searchTerm ||
        b.clientName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDriver =
        !driverFilter || b.driverName === driverFilter;

      const matchesPayment =
        !paymentFilter || b.paymentTypeName === paymentFilter;

      return matchesDate && matchesSearch && matchesDriver && matchesPayment;
    });
  }, [
    bookings,
    startDateFilter,
    endDateFilter,
    searchTerm,
    driverFilter,
    paymentFilter
  ]);

  // 📊 totales
  const totals = useMemo(() => {
    return filteredBookings.reduce(
      (acc, booking) => {
        acc.subtotal += Number(booking.subtotal || 0);
        acc.total += Number(booking.total || 0);
        acc.tax += Number(booking.taxAmount || 0);
        acc.discount += Number(booking.discountAmount || 0);
        return acc;
      },
      { subtotal: 0, total: 0, tax: 0, discount: 0 }
    );
  }, [filteredBookings]);

  if (loading) return <Loading />;

  return (
    <div className="report-container">

      {/* 🔹 HEADER */}
      <div className="report-header">
        <div>
          <h2>Reporte de Transportes</h2>
          <p>Resumen de ingresos, impuestos y descuentos</p>
        </div>
      </div>

      {/* 🔎 FILTROS */}
      <div className="filters-bar">

        <div className="filter-group search">
          <label>Buscar</label>
          <input
            className="search-input"
            type="text"
            placeholder="Cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Desde</label>
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Hasta</label>
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Chofer</label>
          <select
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
          >
            <option value="">Todos</option>
            {driverOptions.map((driver, i) => (
              <option key={i} value={driver}>
                {driver}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Tipo de pago</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="">Todos</option>
            {paymentOptions.map((p, i) => (
              <option key={i} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* 📋 TABLA */}
      <div className="report-table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Chofer</th>
              <th>Pago</th>
              <th>Subtotal</th>
              <th>Descuento</th>
              <th>Impuestos</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No hay datos
                </td>
              </tr>
            ) : (
              filteredBookings.map((b, i) => (
                <tr key={i}>
                  <td>{b.clientName}</td>
                  <td>{formatDate(b.date)}</td>
                  <td>{b.driverName || "-"}</td>
                  <td>{b.paymentTypeName || "-"}</td>

                  <td>${Number(b.subtotal || 0).toFixed(2)}</td>

                  <td className="amount-negative">
                    ${Number(b.discountAmount || 0).toFixed(2)}
                  </td>

                  <td className="amount-positive">
                    ${Number(b.taxAmount || 0).toFixed(2)}
                  </td>

                  <td className="total-cell">
                    ${Number(b.total || 0).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 📌 FOOTER */}
      <div className="totals-footer">
        <div className="totals-group">

          <div className="totals-item">
            <span>Subtotal</span>
            <strong>${totals.subtotal.toFixed(2)}</strong>
          </div>

          <div className="totals-item">
            <span>Descuentos</span>
            <strong>${totals.discount.toFixed(2)}</strong>
          </div>
          
          <div className="totals-item">
            <span>Impuestos</span>
            <strong>${totals.tax.toFixed(2)}</strong>
          </div>

          <div className="totals-item">
            <span>Total</span>
            <strong>${totals.total.toFixed(2)}</strong>
          </div>

        </div>
      </div>

    </div>
  );
};

export default TransportationReport;