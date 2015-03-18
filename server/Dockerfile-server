FROM dockerfile/nodejs

# Install NPM packages
WORKDIR /home/ppnet/server
ADD server/package.json /home/ppnet/server/package.json
RUN npm install
ADD server/* /home/ppnet/server/

# Add www sources
WORKDIR /home/ppnet/
ADD www /home/ppnet/www

WORKDIR /home/ppnet/server
EXPOSE 8000
CMD ./run-server.sh