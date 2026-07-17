import {
  createTransportation,
  updateTransportation
} from "../../../../services/transportation/transportationService";

import {
  createCommission,
  updateCommission,
  deleteCommission,
  getCommissionByBooking
} from "../../../../services/settings/general/commissionService";

export async function saveReservation({

  companyId,
  user,
  mode,
  reservation,
  formData

}) {

  let savedBooking;

  /*
  ==========================================================
  RESERVATION
  ==========================================================
  */

  if (mode === "edit") {

    await updateTransportation(

      companyId,

      reservation.id,

      formData,

      user

    );

    savedBooking = {

      id: reservation.id,

      ...formData

    };

  }

  else {

    const docRef = await createTransportation(

      companyId,

      formData,

      user

    );

    savedBooking = {

      id: docRef.id,

      ...formData

    };

  }

  if (!savedBooking?.id) return;

  /*
  ==========================================================
  COMMISSION
  ==========================================================
  */

  const existingList =
    await getCommissionByBooking(

      companyId,

      savedBooking.id

    );

  const existing = existingList?.[0];

  const price =
    Number(formData.price || 0);

  const discount =
    Number(formData.discountAmount || 0);

  const base =
    Number((price - discount).toFixed(2));

  if (

    formData.commissionEnabled &&

    formData.commissionBeneficiaryId

  ) {

    const amount =

      formData.commissionType === "percentage"

        ? base *

          (formData.commissionValue / 100)

        : formData.commissionValue;

    const commissionData = {

      bookingId: savedBooking.id,

      beneficiaryId:
        formData.commissionBeneficiaryId,

      beneficiaryName:
        formData.commissionBeneficiaryName,

      beneficiaryType:
        formData.commissionBeneficiaryType,

      serviceTypeId:
        formData.serviceTypeId,

      serviceTypeName:
        formData.serviceTypeName,

      amount:
        Number(amount.toFixed(2)),

      baseAmount:
        Number(base),

      type:
        formData.commissionType,

      value:
        formData.commissionValue,

      bookingDate:
        formData.date

    };

    if (existing) {

      await updateCommission(

        companyId,

        existing.id,

        commissionData,

        user

      );

    }

    else {

      await createCommission(

        companyId,

        commissionData,

        user

      );

    }

  }

  else if (

    !formData.commissionEnabled &&

    existing

  ) {

    await deleteCommission(

      companyId,

      existing.id

    );

  }

  return savedBooking;

}