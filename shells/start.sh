echo "Installing......";

basePath=$(pwd)
yarn

dir=${basePath}"/example"
cd $dir
yarn

echo "Running......"
npm run start

