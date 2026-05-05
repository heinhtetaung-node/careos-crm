import React from 'react';

import { useGetAllLeadActivities } from 'data/slices/leadDetails/activitySlice';
import { useGetAllLeadScripts } from 'data/slices/leadDetails/scriptSlice';
import CommentSectionContainer from 'presentation/components/CommentSection/CommentSection';
import CustomTab from 'presentation/components/common/details/CustomTab';
import Loader from 'presentation/components/Loader';
import ScriptSection from 'presentation/components/ScriptSection';
import useGetComment from 'presentation/hooks/getComment';
import useGetScript from 'presentation/hooks/getScript';
import useGetAllActivities from 'presentation/hooks/useGetActivity';
import { getString } from 'presentation/theme/localization';
import { getLeadIdFromPath } from 'shared/helper/utilities';

import AllActivitiesComponent from './AllActivities';

function MainActivityTab() {
  const intialData = { comments: [], nextPageToken: '' };
  const intialScriptData = { scripts: [], nextPageToken: '' };

  const { loadMore, hasMore, commentsData, isLoading } = useGetComment();
  const { scripts: scriptsData } = useGetAllLeadScripts();
  const { activities, nextPageToken } = useGetAllLeadActivities();

  // TODO: Fix this method
  const leadId = getLeadIdFromPath();

  const {
    loadMore: loadMoreActivities,
    hasMore: hasMoreActivities,
    isLoading: isActivitiestLoading,
  } = useGetAllActivities();

  const {
    loadMore: loadMoreScript,
    hasMore: hasMoreScript,
    isLoading: isScriptLoading,
  } = useGetScript(leadId);

  if (isLoading || isScriptLoading) {
    return <Loader />;
  }

  const commentProps = {
    loadMore,
    hasMore,
    data: commentsData || intialData,
  };

  const activityProps = {
    loadMore: loadMoreActivities,
    hasMore: hasMoreActivities,
    isLoading: isActivitiestLoading,
    state: {
      activities,
      nextPageToken,
    },
  };

  const scriptProps = {
    loadMore: loadMoreScript,
    hasMore: hasMoreScript,
    data: scriptsData || intialScriptData,
  };

  const tabs = [
    {
      label: getString('lead.allActivity'),
      component: <AllActivitiesComponent activitiesProps={activityProps} />,
    },
    {
      label: getString('lead.communication'),
      component: <div className="fake-section" />,
    },
    {
      label: getString('lead.comment'),
      component: <CommentSectionContainer {...commentProps} />,
    },
    {
      label: getString('lead.script'),
      component: <ScriptSection {...scriptProps} />,
    },
  ];

  return <CustomTab tabs={tabs} dataTestid="lead-activity-tab" />;
}

export default MainActivityTab;
