

// disable strict SSL for development purpose. This HAS to be changed in a production environment.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

var OSWrap = require('openstack-wrapper');
var keystone = new OSWrap.Keystone('https://62.195.55.145:5000/v3/');


let data_object = {
  "server": {
    "name": "test2", // the new should be changed after each creation. Except when instance is deleted
    "imageRef": "0525f44b-aaeb-4acd-bade-cee56d3449c0", 
    "flavorRef": "1", 
    "networks": [
      {
        "uuid": "8e1585a8-fdac-4296-82bf-b46a0e0ea96c" 
      }
    ],
    "security_groups": [
      {
        "name": "default"
      }
    ],
    "key_name": "cirrosSSH" // use an already created ssh key
  }
};
 
keystone.getToken('admin', 'XBmhca6H6VVvPQhviTigq7SZE35gLCuE', function(error, token){
  if(error)
  {
    console.error('an error occured', error);
  }
  else
  {
    console.log('A general token object has been retrived', token);
    //the token value (token.token) is required for project listing & getting project specific tokens
 
    keystone.getProjectToken(token.token, 'b80cf0fac3734a49920d3502b742a468', function(error, project_token){
      if(error)
      {
        console.error('an error occured', error);
      }
      else
      {
        console.log('A project specific token has been retrived', project_token);
        //the project token contains all kinds of project information
        //including endpoint urls for each of the various systems (Nova, Neutron, Glance)
        //and the token value (project_token.token) required for instantiating all non Keystone Objects
        //see the openstack docs for more specifics on the return format of this object (or print it out I suppose)

        var nova = new OSWrap.Nova('https://62.195.55.145:8774/v2.1', project_token.token);
        
        console.log("Starting instance creation.")
        nova.createServer(data_object, function(error, instance){
          if(error)
          {
            console.error('an error occured', error);
          }
          else
          {
            // console.log('An instance has been created:', instance);
            // Other objects (Glance, Neutron, Nova) and their methods follow a nearly identical pattern
            let server_id = instance.id;
            console.log("Creating new floating ip...");
            // define properties for floatin ip
            let floating_ip_data_object = {
              "pool": "external"
            };

            // create a new floating ip to associate to the newly created instance
            nova.createFloatingIp(floating_ip_data_object, function(err, floatingIpResponse) {
              if (err) {
                console.log(err);
              } else {
                console.log(floatingIpResponse.ip);
                let newFloatingIp = floatingIpResponse.ip;
                let serverId = server_id; // replace with the id of the newly created server

                // Wait 10 seconds before associating the floating IP
                setTimeout(function() {
                  nova.associateFloatingIp(serverId, newFloatingIp, function(err, response) {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log("Successfully associated floating ip to instance.");
                      console.log("Instance creation ended.");
                    }
                  });
                }, 10000);
              }
            });

          }
        });
      }
    });
  }
});