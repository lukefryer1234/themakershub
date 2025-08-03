import React, { useState, useEffect } from 'react';

const Community = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    window.electron.getCommunityProfiles().then(setProfiles);
  }, []);

  const handleUpload = () => {
    // Upload profile logic will go here
  };

  const handleDownload = (profile: any) => {
    // Download profile logic will go here
  };

  return (
    <div>
      <h2>Community Slicer Profile Database</h2>
      <button onClick={handleUpload}>Upload Profile</button>
      <table>
        <thead>
          <tr>
            <th>Printer Model</th>
            <th>Filament</th>
            <th>Nozzle Size</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr key={profile.id}>
              <td>{profile.printerModel}</td>
              <td>{profile.filamentManufacturer} {profile.filamentType}</td>
              <td>{profile.nozzleSize}</td>
              <td>{profile.rating}% Thumbs Up</td>
              <td>
                <button onClick={() => handleDownload(profile)}>Download</button>
                <button onClick={() => window.electron.rateCommunityProfile({ id: profile.id, rating: 'up' })}>👍</button>
                <button onClick={() => window.electron.rateCommunityProfile({ id: profile.id, rating: 'down' })}>👎</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Community;
