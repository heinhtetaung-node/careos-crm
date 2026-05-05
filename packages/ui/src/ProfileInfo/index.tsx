import clsx from 'clsx';
import React from 'react';
import profileInfo from './data.json';

interface ProfileInfoType {
  title: string;
  description?: string;
  isHeader?: boolean;
  key?: string;
}

interface ProfileInfoProps {
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
}

export default function ProfileInfo(profileData: ProfileInfoProps) {
  // map the profile data to the profile information
  Object.entries(profileData).map(([key, value]) => {
    profileInfo.map((item: ProfileInfoType) => {
      if (item.key === key) {
        item.description = value;
      }
    });
  });

  return (
    <div className="bg-white p-4 mb-5 md:mb-8 rounded-lg shadow-custom-shadow divide-y divide-dashed">
      {profileInfo.map((item: ProfileInfoType) => {
        return (
          <div
            className={clsx({
              'break-words': true,
              'grid grid-cols-3 md:grid-cols-2': !item.isHeader,
            })}
            key={item.title}
          >
            {item.isHeader ? (
              <h4 className="py-4 text-left text-primary font-bold">
                {item.title}
              </h4>
            ) : (
              <div className="flex items-center text-sm font-normal text-muted-darker py-2">
                {item.title}
              </div>
            )}
            {item.description && (
              <div className="col-span-2 md:col-span-1 grid grid-cols-3 items-center">
                <span className="col-end-1 mr-2">:</span>
                <div className="col-span-3 text-sm font-normal text-muted-darker py-2">
                  {item.description}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
