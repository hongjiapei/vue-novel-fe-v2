FROM hongjiapei/nginx

COPY nginx.conf /usr/local/nginx/conf.d/nginx.conf

COPY src /data/src

RUN chown -R www-data.www-data /data/src/ && chmod -R 755 /data/src

WORKDIR /data/src

EXPOSE 80

CMD sh -c 'nginx && tail -f /usr/local/nginx/logs/error.log'
