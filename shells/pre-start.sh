echo "Installing......";

basePath=$(pwd)
yarn
npm run build

dir=${basePath}"/example"
cd $dir
yarn

echo "Running......"
npm run start
