#/bin/sh

for i in $(eval echo {2..5000})
do
cp -f phase-two.yaml phase-two_$i.yaml
done