#!/usr/bin/env bash


# Data is loaded by the function `loadBlockFixtures` in test/e2e/explore.test.js
# Example: const data = await readFile(join(__dirname, '/fixtures/explore/blocks', blockCid), { encoding: '' })
save_fixture() {
  local fixture_cid=$1
  shift
  local fixture_path="$1/$fixture_cid"
  echo -e "\$fixture_path: $fixture_path \n"
  npx kubo block get $fixture_cid > $fixture_path
}

# Example call:
# test/e2e/fixtures/generate-fixtures.sh QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D explore/blocks
# saves passed root_cid block to the passed save_path
# Originally intended for helping save fixtures for e2e explore.test.js so we could test files in offline mode. i.e.
# not making network requests.
main () {
  local DIR
  local FILE
  FILE="${BASH_SOURCE[0]:-${(%):-%x}}"
  DIR="$(dirname $FILE)"
  echo -e "\$DIR: $DIR \n"
  local root_cid=$1
  shift
  local save_path="$DIR/$1"
  shift

  echo -e "\$root_cid: $root_cid \n"

  save_fixture $root_cid $save_path

  # Children are not needed for now, but you can get them like so:
  # for cid in $(ipfs ls $root_cid | awk '{ print $1}'); do
  #   echo -e "\$cid: $cid \n"
  #   save_fixture $cid $save_path
  # done
}

main $@
