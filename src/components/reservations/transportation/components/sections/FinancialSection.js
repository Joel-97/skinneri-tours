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


    const handleCommissionToggle = (event) => {

        const enabled =
            event.target.checked;


        setData(prev => ({

            ...prev,

            commissionEnabled: enabled,

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


    const handleCommissionBaseChange = (
        base
    ) => {

        setData(prev => ({

            ...prev,

            commissionBase: base

        }));

    };


    return (
        <>

            {/* ==================================================
                FACTURACIÓN
            ================================================== */}

            <div className="modal-section section-card">

                <h4 className="section-title">
                    Facturación
                </h4>


                <div className="form-grid two-columns">

                    <div className="form-field">

                        <label className="field-label">
                            Origen de la reserva{" "}
                            <span className="required">
                                *
                            </span>
                        </label>

                        <Select
                            {...selectPortal}
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


                    <div className="form-field">

                        <label className="field-label">
                            Pagador
                        </label>

                        <Select
                            {...selectPortal}
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


                <div className="form-grid two-columns">

                    <div className="form-field">

                        <label className="field-label">
                            Tipo de pago
                        </label>

                        <Select
                            {...selectPortal}
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


                    <div className="form-field">

                        <label className="field-label">
                            Estado del pago
                        </label>

                        <Select
                            {...selectPortal}
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


                <div className="form-grid two-columns">

                    <div className="form-field">

                        <label className="field-label">
                            Descuento
                        </label>

                        <Select
                            {...selectPortal}
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


                    <div className="form-field">

                        <label className="field-label">
                            Monto
                        </label>

                        <div className="price-input-wrapper">

                            <span className="currency-symbol">
                                {data.symbol || data.currency}
                            </span>

                            <input
                                type="number"
                                name="price"
                                value={data.price}
                                onChange={handleChange}
                                className="price-input"
                            />

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                IMPUESTOS
            ================================================== */}

            <div className="modal-section section-card">

                <h4 className="section-title">
                    Impuestos
                </h4>


                <div className="tax-list">

                    {taxes.map(tax => (

                        <label
                            key={tax.id}
                            className="tax-item"
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
                            />

                            {tax.name} ({tax.rate}%)

                        </label>

                    ))}

                </div>

            </div>


            {/* ==================================================
                COMISIÓN
            ================================================== */}

            <div className="modal-section section-card financial-commission-section">

                <div className="financial-commission-header">

                    <h4 className="financial-commission-title">
                        Comisión
                    </h4>

                </div>


                {/* ACTIVAR COMISIÓN */}

                <div className="financial-commission-toggle">

                    <label className="financial-commission-toggle-label">

                        <input
                            type="checkbox"
                            checked={commissionEnabled}
                            onChange={handleCommissionToggle}
                            className="financial-commission-toggle-input"
                        />

                        <span className="financial-commission-toggle-text">
                            Aplicar comisión
                        </span>

                    </label>

                </div>


                {commissionEnabled && (

                    <div className="financial-commission-content">


                        {/* ==================================================
                            CONFIGURACIÓN PRINCIPAL
                        ================================================== */}

                        <div className="financial-commission-grid">


                            {/* COMISIONISTA */}

                            <div className="financial-commission-field">

                                <label className="financial-commission-label">
                                    Comisionista
                                </label>

                                <Select
                                    {...selectPortal}
                                    className="financial-commission-select"
                                    classNamePrefix="financial-commission-select"
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

                            <div className="financial-commission-field">

                                <label className="financial-commission-label">
                                    Tipo de comisión
                                </label>

                                <div className="financial-commission-value">

                                    {data.commissionType ===
                                    "percentage"

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

                            <div className="financial-commission-base">

                                <div className="financial-commission-base-header">

                                    <div>

                                        <span className="financial-commission-base-label">
                                            Calcular comisión sobre
                                        </span>

                                        <p className="financial-commission-base-description">
                                            Selecciona el monto utilizado
                                            para calcular la comisión.
                                        </p>

                                    </div>

                                </div>


                                <div className="financial-commission-base-options">


                                    {/* PRECIO ORIGINAL */}

                                    <label
                                        className={`financial-commission-base-option ${
                                            commissionBase === "original"
                                                ? "financial-commission-base-option-active"
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
                                            className="financial-commission-base-radio"
                                        />


                                        <span className="financial-commission-base-content">

                                            <span className="financial-commission-base-title">
                                                Precio original
                                            </span>

                                            <strong className="financial-commission-base-amount">
                                                {formatCurrency(
                                                    originalCommissionBase
                                                )}
                                            </strong>

                                        </span>

                                    </label>


                                    {/* PRECIO DESPUÉS DEL DESCUENTO */}

                                    <label
                                        className={`financial-commission-base-option ${
                                            commissionBase === "afterDiscount"
                                                ? "financial-commission-base-option-active"
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
                                            className="financial-commission-base-radio"
                                        />


                                        <span className="financial-commission-base-content">

                                            <span className="financial-commission-base-title">
                                                Precio después del descuento
                                            </span>

                                            <strong className="financial-commission-base-amount">
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

                        <div className="financial-commission-result">

                            <div className="financial-commission-result-header">

                                <span className="financial-commission-result-label">
                                    Comisión calculada
                                </span>

                            </div>


                            <div className="financial-commission-result-content">

                                <span className="financial-commission-result-description">

                                    {data.commissionType ===
                                    "percentage"

                                        ? `${data.commissionValue || 0}% de ${formatCurrency(
                                            commissionBaseAmount
                                        )}`

                                        : `${formatCurrency(
                                            data.commissionValue || 0
                                        )} fijo`

                                    }

                                </span>


                                <strong className="financial-commission-result-amount">

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

            <div className="modal-section section-card">

                <h4 className="section-title">
                    Resumen financiero
                </h4>


                <div className="financial-summary">

                    <p>

                        Subtotal:

                        {" "}

                        {data.symbol}

                        {" "}

                        {safe(data.price)}

                    </p>


                    <p>

                        Descuento:

                        {" "}

                        -

                        {" "}

                        {data.symbol}

                        {" "}

                        {safe(discountAmount)}

                    </p>


                    <p>

                        Impuestos:

                        {" "}

                        {data.symbol}

                        {" "}

                        {safe(totalTax)}

                    </p>


                    <hr />


                    <p className="total">

                        Total:

                        {" "}

                        {data.symbol}

                        {" "}

                        {safe(total)}

                    </p>

                </div>

            </div>

        </>

    );

}