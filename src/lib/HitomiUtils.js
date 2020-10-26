function url_from_url_from_hash(galleryid, image, dir, ext, base) {
  return url_from_url(url_from_hash(galleryid, image, dir, ext), base);
}

function url_from_url(url, base) {
  return url.replace(/\/\/..?\.hitomi\.la\//, '//'+subdomain_from_url(url, base)+'.hitomi.la/');
}

function url_from_hash(galleryid, image, dir, ext) {
  ext = ext || dir || image.name.split('.').pop();
  dir = dir || 'images';
  
  return 'https://a.hitomi.la/'+dir+'/'+full_path_from_hash(image.hash)+'.'+ext;
}

function full_path_from_hash(hash) {
  if (hash.length < 3) {
          return hash;
  }
  return hash.replace(/^.*(..)(.)$/, '$2/$1/'+hash);
}

function subdomain_from_url(url, base) {
  var retval = 'b';
  if (base) {
          retval = base;
  }
  
  var number_of_frontends = 3;
  var b = 16;
  
  var r = /\/[0-9a-f]\/([0-9a-f]{2})\//;
  var m = r.exec(url);
  if (!m) {
          return 'a';
  }
  
  var g = parseInt(m[1], b);
  if (!isNaN(g)) {
          if (g < 0x30) {
                  number_of_frontends = 2;
          }
          if (g < 0x09) {
                  g = 1;
          }
          retval = subdomain_from_galleryid(g, number_of_frontends) + retval;
  }
  
  return retval;
}

function subdomain_from_galleryid(g, number_of_frontends) {
  var o = g % number_of_frontends;

  return String.fromCharCode(97 + o);
}

exports.getUrlFile = (galleryid, image) => {
  return url_from_url_from_hash(galleryid, image);
}
