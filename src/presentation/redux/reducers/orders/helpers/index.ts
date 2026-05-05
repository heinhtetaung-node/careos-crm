export const updateManualOrderList = ({
  data,
  listCheckBox,
  agentFullName,
}: any) =>
  data.map((order: any) => {
    if (listCheckBox.includes(order.id)) {
      return {
        ...order,
        assignedTo: agentFullName,
      };
    }
    return order;
  });

export default { updateManualOrderList };
