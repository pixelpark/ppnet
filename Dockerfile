FROM gliderlabs/alpine

RUN apk-install nginx curl

RUN curl -sL https://github.com/pixelpark/ppnet/archive/master.tar.gz | tar zx ppnet-master/www -C /usr

ADD server/nginx.conf /etc/nginx/nginx.conf

ADD server/nginx-run.sh /usr/local/bin/run.sh

EXPOSE 80

CMD ["/usr/local/bin/run.sh"]
