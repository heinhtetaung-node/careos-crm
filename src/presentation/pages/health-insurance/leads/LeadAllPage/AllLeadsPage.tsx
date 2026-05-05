import React, { useEffect, useState } from 'react';
import AllLeadsPage from '.';
import { useGetUserSelector } from 'presentation/redux/selectors/user';

export default function LeadAllPage() {
  const [refresh, setRefresh] = useState<boolean>(false);
  const currentUser = useGetUserSelector();
  const [selectedListView, setSelectedListView] = useState<string>('allLeads');

  useEffect(() => {
    setRefresh(true);
    setTimeout(() => {
      setRefresh(false);
    }, 100);
  }, [selectedListView]);

  useEffect(() => {
    if (currentUser?.role === 'roles/sales') {
      setSelectedListView('myLeads');
    }
  }, [currentUser]);

  if (refresh || !currentUser) return <></>;

  return (
    <AllLeadsPage
      selectedListView={selectedListView}
      setSelectedListView={setSelectedListView}
      currentUser={currentUser}
    />
  );
}
