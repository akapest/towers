#!/sbin/runscript

depend() {
    need net mysql
}

start() {
    su -c "/srv/gomap/play-1.2.7/play start /srv/gomap/towers --%prod" gomap
}

stop() {
    su -c "/srv/gomap/play-1.2.7/play stop /srv/gomap/towers" gomap
}

restart(){
    su -c "/srv/gomap/play-1.2.7/play stop /srv/gomap/towers" gomap & wait
    if [ -f /home/gomap/towers/server.pid] ; then
        rm /home/gomap/towers/server.pid
    fi
    su -c "/srv/gomap/play-1.2.7/play start /srv/gomap/towers --%prod" gomap
}
