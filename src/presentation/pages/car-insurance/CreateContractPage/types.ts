export const showContractMessage = (
  customerName: string,
  humanId: string,
  licensePlate: string,
  contractLink: string
) => {
  return `ขอส่งสัญญาผ่อนชำระเบี้ยประกัน รหัส ${humanId} ยืนยันที่: ${contractLink}`;
};

export interface CreateContractSubmitProps {
  firstMonth: number;
  followingMonth: number;
  paymentOption: number;
  paymentMethod: number;
  issuingBank: number;
  installmentPlan: number;
  installmentDate: string;
  endDate: Date;
}
