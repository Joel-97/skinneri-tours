import React from "react";
import Select from "react-select";

import {
    selectPortal
} from "../../constants/transportationConstants";

import {
    paymentStatusOptions
} from "../../../../../constants/transportation/paymentStatusOptions";

import {
    safe,
    formatCurrency
} from "../../../../../services/Tools";


export default function FinancialSection({
    controller
}) {

    const {
        form,
        settings,
        financial,
        options,
        actions
    } = controller;

    const {
        data,
        setData
    } = form;

    const {
        taxes,
        bookingSources,
        payers
    } = settings;

    const {
        discountOptions,
        paymentTypeOptions,
        bookingSourceOptions,
        payerOptions,
        commissionOptions
    } = options;

    const {
        handleChange,
        toggleTax
    } = actions;

    const {
        discountAmount,
        totalTax,
        total,
        originalCommissionBase,
        discountedCommissionBase,
        commissionBase,
        commissionBaseAmount,
        commissionAmount
    } = financial;

    const hasDiscount =
        Number(discountAmount || 0) > 0;

    const commissionEnabled =
        Boolean(data.commissionEnabled);


    /*
    =========================================================
    REACT SELECT STYLES
    =========================================================
    */

    const selectStyles = {
    ...selectPortal.styles,

    option: (base, state) => ({
        ...base,

        backgroundColor:
            state.isSelected
                ? "#08204B"
                : state.isFocused
                    ? "#08204B"
                    : "#FFFFFF",

        color:
            state.isSelected || state.isFocused
                ? "#FFFFFF"
                : "#334155",

        cursor: "pointer"
    }),

    control: (base, state) => ({
        ...base,

        borderColor:
            state.isFocused
                ? "#08204B"
                : "#d1d9e3",

        boxShadow:
            state.isFocused
                ? "0 0 0 3px rgba(8, 32, 75, 0.07)"
                : "none",

        "&:hover": {
            borderColor: "#08204B"
        }
    }),

    singleValue: (base) => ({
        ...base,
        color: "#334155"
    }),

    placeholder: (base) => ({
        ...base,
        color: "#94a3b8"
    }),

    dropdownIndicator: (base, state) => ({
        ...base,

        color:
            state.isFocused
                ? "#08204B"
                : "#94a3b8",

        "&:hover": {
            color: "#08204B"
        }
    }),

    clearIndicator: (base) => ({
        ...base,

        color: "#94a3b8",

        "&:hover": {
            color: "#08204B"
        }
    }),

    menuPortal: (base) => ({
        ...base,
        zIndex: 99999
    })
};


    /*
    =========================================================
    COMMISSION TOGGLE
    =========================================================
    */

    const handleCommissionToggle = (event) => {

        const enabled =
            event.target.checked;

        setData(prev => ({
            ...prev,

            commissionEnabled:
                enabled,

            ...(enabled
                ? {}
                : {
                    commissionBeneficiaryId: "",
                    commissionBeneficiaryName: "",
                    commissionBeneficiaryType: "",

                    commissionType: "percentage",
                    commissionValue: 0,

                    commissionBase: "original",
                    commissionBaseAmount: 0,
                    commissionAmount: 0,

                    commissionId: null
                }
            )
        }));
    };


    /*
    =========================================================
    COMMISSION BASE
    =========================================================
    */

    const handleCommissionBaseChange = (
        base
    ) => {

        setData(prev => ({
            ...prev,

            commissionBase:
                base
        }));
    };


    return (

        <>

            {/* ==================================================
                FACTURACIÓN
            ================================================== */}

            <div className="transportation-financial-section section-card">

                <div className="transportation-financial-section-header">

                    <h4 className="transportation-financial-section-title">
                        Facturación
                    </h4>

                </div>


                {/* ==================================================
                    ORIGEN / PAGADOR
                ================================================== */}

                <div className="transportation-financial-section-grid transportation-financial-section-grid-two-columns">

                    {/* ORIGEN */}

                    <div className="transportation-financial-section-field">

                        <label className="transportation-financial-section-label">

                            Origen de la reserva{" "}

                            <span className="transportation-financial-section-required">
                                *
                            </span>

                        </label>


                        <Select
                            {...selectPortal}

                            className="transportation-financial-section-select"

                            classNamePrefix="transportation-financial-section-select"

                            styles={selectStyles}

                            options={bookingSourceOptions}

                            value={
                                bookingSourceOptions.find(
                                    option =>
                                        option.value ===
                                        data.bookingSourceId
                                ) || null
                            }

                            onChange={(selectedOption) => {

                                const selectedSource =
                                    bookingSources.find(
                                        source =>
                                            source.id ===
                                            selectedOption?.value
                                    );

                                setData(prev => ({
                                    ...prev,

                                    bookingSourceId:
                                        selectedSource?.id || "",

                                    bookingSourceName:
                                        selectedSource?.name || ""
                                }));
                            }}

                            placeholder="Seleccionar origen"

                            isClearable

                            isSearchable
                        />

                    </div>


                    {/* PAGADOR */}

                    <div className="transportation-financial-section-field">

                        <label className="transportation-financial-section-label">
                            Pagador
                        </label>


                        <Select
                            {...selectPortal}

                            className="transportation-financial-section-select"

                            classNamePrefix="transportation-financial-section-select"

                            styles={selectStyles}

                            options={payerOptions}

                            value={
                                payerOptions.find(
                                    option =>
                                        option.value ===
                                        data.payerId
                                ) || null
                            }

                            onChange={(selectedOption) => {

                                const selectedPayer =
                                    payers.find(
                                        payer =>
                                            payer.id ===
                                            selectedOption?.value
                                    );

                                setData(prev => ({
                                    ...prev,

                                    payerId:
                                        selectedPayer?.id || "",

                                    payerName:
                                        selectedPayer?.name || ""
                                }));
                            }}

                            placeholder="Seleccionar pagador"

                            isClearable

                            isSearchable
                        />

                    </div>

                </div>


                {/* ==================================================
                    TIPO DE PAGO / ESTADO
                ================================================== */}

                <div className="transportation-financial-section-grid transportation-financial-section-grid-two-columns">

                    {/* TIPO DE PAGO */}

                    <div className="transportation-financial-section-field">

                        <label className="transportation-financial-section-label">
                            Tipo de pago
                        </label>


                        <Select
                            {...selectPortal}

                            className="transportation-financial-section-select"

                            classNamePrefix="transportation-financial-section-select"

                            styles={selectStyles}

                            options={paymentTypeOptions}

                            value={
                                paymentTypeOptions.find(
                                    option =>
                                        option.value ===
                                        data.paymentTypeId
                                ) || null
                            }

                            onChange={(selectedOption) =>
                                setData(prev => ({
                                    ...prev,

                                    paymentTypeId:
                                        selectedOption?.value || ""
                                }))
                            }

                            placeholder="Seleccionar"

                            isClearable
                        />

                    </div>


                    {/* ESTADO DEL PAGO */}

                    <div className="transportation-financial-section-field">

                        <label className="transportation-financial-section-label">
                            Estado del pago
                        </label>


                        <Select
                            {...selectPortal}

                            className="transportation-financial-section-select"

                            classNamePrefix="transportation-financial-section-select"

                            styles={selectStyles}

                            options={paymentStatusOptions}

                            value={
                                paymentStatusOptions.find(
                                    option =>
                                        option.value ===
                                        data.paymentStatus
                                ) || null
                            }

                            onChange={(selectedOption) =>
                                setData(prev => ({
                                    ...prev,

                                    paymentStatus:
                                        selectedOption?.value || ""
                                }))
                            }

                            placeholder="Seleccionar"

                            isSearchable={false}

                            isClearable
                        />

                    </div>

                </div>


                {/* ==================================================
                    DESCUENTO / MONTO
                ================================================== */}

                <div className="transportation-financial-section-grid transportation-financial-section-grid-two-columns">

                    {/* DESCUENTO */}

                    <div className="transportation-financial-section-field">

                        <label className="transportation-financial-section-label">
                            Descuento
                        </label>


                        <Select
                            {...selectPortal}

                            className="transportation-financial-section-select"

                            classNamePrefix="transportation-financial-section-select"

                            styles={selectStyles}

                            options={discountOptions}

                            value={
                                discountOptions.find(
                                    option =>
                                        option.value ===
                                        (data.discountId || "")
                                ) || null
                            }

                            onChange={(selectedOption) =>
                                handleChange({
                                    target: {
                                        name: "discountId",
                                        value:
                                            selectedOption?.value || ""
                                    }
                                })
                            }

                            placeholder="Sin descuento"

                            isSearchable={false}

                            isClearable
                        />

                    </div>


                    {/* MONTO */}

                    <div className="transportation-financial-section-field">

                        <label className="transportation-financial-section-label">
                            Monto
                        </label>


                        <div className="transportation-financial-section-price-wrapper">

                            <span className="transportation-financial-section-currency-symbol">
                                {data.symbol || data.currency}
                            </span>


                            <input
                                type="number"

                                name="price"

                                value={data.price}

                                onChange={handleChange}

                                className="transportation-financial-section-price-input"
                            />

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                IMPUESTOS
            ================================================== */}

            <div className="transportation-financial-section section-card">

                <div className="transportation-financial-section-header">

                    <h4 className="transportation-financial-section-title">
                        Impuestos
                    </h4>

                </div>


                <div className="transportation-financial-section-tax-list">

                    {taxes.map(tax => (

                        <label
                            key={tax.id}

                            className="transportation-financial-section-tax-item"
                        >

                            <input
                                type="checkbox"

                                checked={
                                    data.activeTaxIds.includes(
                                        tax.id
                                    )
                                }

                                onChange={() =>
                                    toggleTax(tax.id)
                                }

                                className="transportation-financial-section-tax-checkbox"
                            />


                            <span className="transportation-financial-section-tax-label">
                                {tax.name} ({tax.rate}%)
                            </span>

                        </label>

                    ))}

                </div>

            </div>


            {/* ==================================================
                COMISIÓN
            ================================================== */}

            <div className="transportation-financial-section section-card transportation-financial-section-commission">

                <div className="transportation-financial-section-header">

                    <h4 className="transportation-financial-section-title">
                        Comisión
                    </h4>


                    {/* ACTIVAR COMISIÓN */}

                    <div className="transportation-financial-section-commission-toggle">

                        <label className="transportation-financial-section-commission-toggle-label">

                            <input
                                type="checkbox"

                                checked={commissionEnabled}

                                onChange={handleCommissionToggle}

                                className="transportation-financial-section-commission-toggle-input"
                            />

                            <span className="transportation-financial-section-commission-toggle-text">
                                Aplicar comisión
                            </span>

                        </label>

                    </div>

                </div>


                {commissionEnabled && (

                    <div className="transportation-financial-section-commission-content">


                        {/* ==================================================
                            CONFIGURACIÓN PRINCIPAL
                        ================================================== */}

                        <div className="transportation-financial-section-grid transportation-financial-section-grid-two-columns">


                            {/* COMISIONISTA */}

                            <div className="transportation-financial-section-field">

                                <label className="transportation-financial-section-label">
                                    Comisionista
                                </label>


                                <Select
                                    {...selectPortal}

                                    className="transportation-financial-section-select"

                                    classNamePrefix="transportation-financial-section-select"

                                    styles={selectStyles}

                                    options={commissionOptions}

                                    value={
                                        commissionOptions.find(
                                            option =>
                                                option.value ===
                                                data.commissionBeneficiaryId
                                        ) || null
                                    }

                                    onChange={(selected) =>
                                        handleChange({
                                            target: {
                                                name:
                                                    "commissionBeneficiaryId",

                                                value:
                                                    selected?.value || ""
                                            }
                                        })
                                    }

                                    placeholder="Seleccionar comisionista"

                                    isClearable
                                />

                            </div>


                            {/* TIPO DE COMISIÓN */}

                            <div className="transportation-financial-section-field">

                                <label className="transportation-financial-section-label">
                                    Tipo de comisión
                                </label>


                                <div className="transportation-financial-section-commission-value">

                                    {data.commissionType === "percentage"

                                        ? `${data.commissionValue || 0}%`

                                        : formatCurrency(
                                            data.commissionValue || 0
                                        )
                                    }

                                </div>

                            </div>

                        </div>


                        {/* ==================================================
                            BASE DE COMISIÓN
                        ================================================== */}

                        {hasDiscount && (

                            <div className="transportation-financial-section-commission-base">

                                <div className="transportation-financial-section-commission-base-header">

                                    <div>

                                        <span className="transportation-financial-section-commission-base-label">
                                            Calcular comisión sobre
                                        </span>


                                        <p className="transportation-financial-section-commission-base-description">
                                            Selecciona el monto utilizado
                                            para calcular la comisión.
                                        </p>

                                    </div>

                                </div>


                                <div className="transportation-financial-section-commission-base-options">


                                    {/* PRECIO ORIGINAL */}

                                    <label
                                        className={`transportation-financial-section-commission-base-option ${
                                            commissionBase === "original"
                                                ? "transportation-financial-section-commission-base-option-active"
                                                : ""
                                        }`}
                                    >

                                        <input
                                            type="radio"

                                            name="commissionBase"

                                            value="original"

                                            checked={
                                                commissionBase ===
                                                "original"
                                            }

                                            onChange={() =>
                                                handleCommissionBaseChange(
                                                    "original"
                                                )
                                            }

                                            className="transportation-financial-section-commission-base-radio"
                                        />


                                        <span className="transportation-financial-section-commission-base-content">

                                            <span className="transportation-financial-section-commission-base-title">
                                                Precio original
                                            </span>


                                            <strong className="transportation-financial-section-commission-base-amount">

                                                {formatCurrency(
                                                    originalCommissionBase
                                                )}

                                            </strong>

                                        </span>

                                    </label>


                                    {/* PRECIO DESPUÉS DEL DESCUENTO */}

                                    <label
                                        className={`transportation-financial-section-commission-base-option ${
                                            commissionBase === "afterDiscount"
                                                ? "transportation-financial-section-commission-base-option-active"
                                                : ""
                                        }`}
                                    >

                                        <input
                                            type="radio"

                                            name="commissionBase"

                                            value="afterDiscount"

                                            checked={
                                                commissionBase ===
                                                "afterDiscount"
                                            }

                                            onChange={() =>
                                                handleCommissionBaseChange(
                                                    "afterDiscount"
                                                )
                                            }

                                            className="transportation-financial-section-commission-base-radio"
                                        />


                                        <span className="transportation-financial-section-commission-base-content">

                                            <span className="transportation-financial-section-commission-base-title">
                                                Precio después del descuento
                                            </span>


                                            <strong className="transportation-financial-section-commission-base-amount">

                                                {formatCurrency(
                                                    discountedCommissionBase
                                                )}

                                            </strong>

                                        </span>

                                    </label>

                                </div>

                            </div>

                        )}


                        {/* ==================================================
                            RESULTADO DE COMISIÓN
                        ================================================== */}

                        <div className="transportation-financial-section-commission-result">

                            <div className="transportation-financial-section-commission-result-header">

                                <span className="transportation-financial-section-commission-result-label">
                                    Comisión calculada
                                </span>

                            </div>


                            <div className="transportation-financial-section-commission-result-content">

                                <span className="transportation-financial-section-commission-result-description">

                                    {data.commissionType === "percentage"

                                        ? `${data.commissionValue || 0}% de ${formatCurrency(
                                            commissionBaseAmount
                                        )}`

                                        : `${formatCurrency(
                                            data.commissionValue || 0
                                        )} fijo`
                                    }

                                </span>


                                <strong className="transportation-financial-section-commission-result-amount">

                                    {formatCurrency(
                                        commissionAmount
                                    )}

                                </strong>

                            </div>

                        </div>

                    </div>

                )}

            </div>


            {/* ==================================================
                RESUMEN FINANCIERO
            ================================================== */}

            <div className="transportation-financial-section section-card">

                <div className="transportation-financial-section-header">

                    <h4 className="transportation-financial-section-title">
                        Resumen financiero
                    </h4>

                </div>


                <div className="transportation-financial-section-summary">

                    <p>

                        <span className="transportation-financial-section-summary-label">
                            Subtotal:
                        </span>

                        <span className="transportation-financial-section-summary-value">
                            {data.symbol} {safe(data.price)}
                        </span>

                    </p>


                    <p>

                        <span className="transportation-financial-section-summary-label">
                            Descuento:
                        </span>

                        <span className="transportation-financial-section-summary-value">
                            - {data.symbol} {safe(discountAmount)}
                        </span>

                    </p>


                    <p>

                        <span className="transportation-financial-section-summary-label">
                            Impuestos:
                        </span>

                        <span className="transportation-financial-section-summary-value">
                            {data.symbol} {safe(totalTax)}
                        </span>

                    </p>


                    <hr />


                    <p className="transportation-financial-section-summary-total">

                        <span className="transportation-financial-section-summary-total-label">
                            Total:
                        </span>

                        <span className="transportation-financial-section-summary-total-value">
                            {data.symbol} {safe(total)}
                        </span>

                    </p>

                </div>

            </div>

        </>

    );

}