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

export default function FinancialSection({ controller }) {

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

    commissionAgents,

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

    baseForCommission

  } = financial;

  return (

    <>

      {/* ======================================================
          FACTURACIÓN
      ====================================================== */}

      <div className="modal-section section-card">

        <h4 className="section-title">

          Facturación

        </h4>

        {/* ========================
          ORIGEN DE LA RESERVA Y PAGADOR
        =========================== */}

        <div className="form-grid two-columns">

          <div className="form-field">

            <label className="field-label">

              Origen de la reserva <span className="required">*</span>

            </label>

            <Select

              {...selectPortal}

              options={bookingSourceOptions}

              value={
                bookingSourceOptions.find(
                  option => option.value === data.bookingSourceId
                ) || null
              }

              onChange={(selectedOption) => {

                const selectedSource = bookingSources.find(
                  source => source.id === selectedOption?.value
                );

                setData(prev => ({

                  ...prev,

                  bookingSourceId: selectedSource?.id || "",

                  bookingSourceName: selectedSource?.name || ""

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
                  option => option.value === data.payerId
                ) || null
              }

              onChange={(selectedOption) => {

                const selectedPayer = payers.find(
                  payer => payer.id === selectedOption?.value
                );

                setData(prev => ({

                  ...prev,

                  payerId: selectedPayer?.id || "",

                  payerName: selectedPayer?.name || ""

                }));

              }}

              placeholder="Seleccionar pagador"

              isClearable

              isSearchable

            />

          </div>

        </div>

        {/* ========================
          TIPO DE PAGO Y ESTADO DE PAGO
        =========================== */}

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

                  option => option.value === data.paymentTypeId

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
                  option => option.value === data.paymentStatus
                ) || null
              }

              onChange={(selectedOption) =>

                setData(prev => ({

                  ...prev,

                  paymentStatus: selectedOption?.value || ""

                }))

              }

              placeholder="Seleccionar"

              isSearchable={false}

              isClearable

            />

          </div>

        </div>

        {/* ========================
          DESCUENTO Y MONTO
        =========================== */}

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

                  option => option.value === (data.discountId || "")

                ) || null

              }

              onChange={(selectedOption) =>

                setData(prev => ({

                  ...prev,

                  discountId:

                    selectedOption?.value || ""

                }))

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

      {/* ======================================================
          IMPUESTOS
      ====================================================== */}

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

                  data.activeTaxIds.includes(tax.id)

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

      {/* ======================================================
          COMISIÓN
      ====================================================== */}

      <div className="modal-section section-card">

        <h4 className="section-title">

          Comisión

        </h4>

        <div className="form-checkbox">

          <label>

            <input

              type="checkbox"

              checked={data.commissionEnabled}

              onChange={(e) =>

                setData(prev => ({

                  ...prev,

                  commissionEnabled: e.target.checked,

                  ...(e.target.checked === false && {

                    commissionBeneficiaryId: "",

                    commissionBeneficiaryName: "",

                    commissionBeneficiaryType: "",

                    commissionType: "percentage",

                    commissionValue: 0

                  })

                }))

              }

            />

            Aplicar comisión

          </label>

        </div>

        {data.commissionEnabled && (

          <div className="form-grid two-columns">

            <div className="form-field">

              <label className="field-label">

                Comisionista

              </label>

              <Select

                {...selectPortal}

                options={commissionOptions}

                value={

                  commissionOptions.find(

                    option =>

                      option.value ===

                      data.commissionBeneficiaryId

                  ) || null

                }

                onChange={(selected) => {

                  const agent = commissionAgents.find(

                    item => item.id === selected?.value

                  );

                  setData(prev => ({

                    ...prev,

                    commissionBeneficiaryId:

                      selected?.value || "",

                    commissionBeneficiaryName:

                      selected?.label || "",

                    commissionBeneficiaryType:

                      selected?.type || "",

                    commissionType:

                      agent?.commissionType ||

                      "percentage",

                    commissionValue:

                      Number(

                        agent?.commissionValue || 0

                      )

                  }));

                }}

                placeholder="Seleccionar"

                isClearable

              />

            </div>

            <div className="form-field full-width">

              <label className="field-label">

                Comisión estimada

              </label>

              <div className="commission-preview">

                {data.commissionType === "percentage"

                  ? `${data.commissionValue || 0}% de ${formatCurrency(baseForCommission)}`

                  : `${formatCurrency(data.commissionValue || 0)} fijo`

                }

                <strong>

                  {" → "}

                  {formatCurrency(

                    data.commissionType === "percentage"

                      ? (

                          baseForCommission *

                          (data.commissionValue || 0)

                        ) / 100

                      : data.commissionValue || 0

                  )}

                </strong>

              </div>

            </div>

          </div>

        )}

      </div>

      {/* ======================================================
          RESUMEN
      ====================================================== */}

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