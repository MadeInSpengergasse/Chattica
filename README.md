```
npm install
cd static && bower update && cd ..
npm start
```
Visit localhost:3000 for the interface.

## Autostart
```
# To give systemd the unit file
ln -s $(pwd)/chattica.service /etc/systemd/system/
# To autostart the software at boot
ln -s /etc/systemd/system/chattica.service /etc/systemd/system/multi-user.target.wants/
```
Then edit the file to have the right path to the software.
