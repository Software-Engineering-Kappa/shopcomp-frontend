# ShopComp (frontend)

## How to Deploy to s3
### Build the static file
- `npm run build`

This will generate an `out/` folder containing static resources (HTML files, folders, images, etc)

### Upload the static files
- shop-comp-s3-bucket -> Objects -> Upload
- Upload the contents of `out/`, *NOT* the whole folder
- Upload all sub-folders, HDML files, images, etc. You can skip the `.text` files

### Make all files public
- Objects -> Select all files -> Actions -> Make public using ACL

Link: http://shop-comp-s3-bucket.s3-website-us-east-1.amazonaws.com

*NOTE: Can access other pages with /page_name.html at the end. We can change this to not need to include .html later if we want.*