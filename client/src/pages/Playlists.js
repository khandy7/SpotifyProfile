import { useState, useEffect } from 'react';
import { catchErrors } from '../utils';
import { getCurrentUserPlaylists } from '../Spotify';
import  axios from "axios";
import { SectionWrapper, PlaylistsGrid, Loader } from '../components';


const Playlists = () => {
    const [playlistsData, setPlaylistsData] = useState(null);
    const [playlists, setPlaylists] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
          const userPlaylists = await getCurrentUserPlaylists();
          setPlaylistsData(userPlaylists.data);
          setPlaylists(userPlaylists.data.items);
        };
    
        catchErrors(fetchData());
      }, []);

        // When playlistsData updates, check if there are more playlists to fetch
        // then update the state variable
        useEffect(() => {
            if (!playlistsData) {
            return;
            }

            // Playlist endpoint only returns 20 playlists at a time, so we need to
            // make sure we get ALL playlists by fetching the next set of playlists
            const fetchMoreData = async () => {
                if (playlistsData.next && playlistsData.next !== null) {
                    const { data } = await axios.get(playlistsData.next);
                    setPlaylistsData(data);
                    setPlaylists(() => [...(playlists ? playlists : []), ...data.items]); 
                }
            };

            // Use functional update to update playlists state variable
            // to avoid including playlists as a dependency for this hook
            // and creating an infinite loop
            // setPlaylists(playlists => ([
            // ...playlists ? playlists : [],
            // ...playlistsData.items
            // ]));

            // Fetch next set of playlists as needed
            catchErrors(fetchMoreData());

        }, [playlistsData, playlists]);


    return(
        <main>
        <SectionWrapper title="Playlists" breadcrumb="true">
            {playlists ? (
                <PlaylistsGrid playlists={playlists} />
            ) : (
                <Loader/>
            )}
        </SectionWrapper>
        </main>
    );
}

export default Playlists;