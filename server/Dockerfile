FROM dockerfile/nodejs

WORKDIR /home/ppnet

# Install NPM packages
ADD package.json /home/ppnet/package.json
RUN npm install

ADD . /home/ppnet

# TODO configure right database remote

EXPOSE 80

CMD /usr/local/bin/node proxy.js