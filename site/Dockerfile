FROM node:12-alpine as build

ENV APP=/apps/site
RUN mkdir -p $APP
COPY . $APP/

WORKDIR $APP
RUN apk --no-cache add git python3 build-base
RUN yarn install
RUN git clone https://github.com/grindjs/docs.git --branch 0.5 --single-branch --depth 1 ../docs/0.5
RUN git clone https://github.com/grindjs/docs.git --branch 0.6 --single-branch --depth 1 ../docs/0.6
RUN git clone https://github.com/grindjs/docs.git --branch 0.7 --single-branch --depth 1 ../docs/0.7
RUN git clone https://github.com/grindjs/docs.git --branch master --single-branch --depth 1 ../docs/master
RUN NODE_ENV=production yarn cli assets:publish
RUN NODE_ENV=production yarn cli view:cache
RUN NODE_ENV=production yarn build
RUN rm -fr node_modules && yarn install --production

# Build final docker image
FROM node:12-alpine
WORKDIR /apps/site
COPY --from=build /apps /apps

ENV NODE_ENV production
EXPOSE 3900
CMD build/cli serve
