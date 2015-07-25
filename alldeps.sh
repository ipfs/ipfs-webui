echo deps for webui...
npm install
for d in $(ls -d -1 $PWD/apps/*)
do
		echo deps for $d...
    ( cd $d && npm install )
done
