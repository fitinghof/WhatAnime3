# WhatAnime?

WhatAnime? is a simple docker webservice that you can use to check what anime the song you are listening is from.
The site also contains simple moderation tools if you want more precise bind controls.

## Setup

- First create a spotify developer app, this is free and can be done at https://developer.spotify.com/
- Then make a new .env containing the variables from the example.env
- fill in the information asked for in the .env
- run 'docker compose build' from WhatAnime root
- run 'docker compose up -d'
- The database directory will now have been created, this likely has the wrong PID/GID, run 'sudo chown PID:GID ./database' from WhatAnime root with the same PID/GID you set in the .env file
