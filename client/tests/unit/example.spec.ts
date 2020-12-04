import { shallowMount } from "@vue/test-utils";
import Home from "@/components/NavBar.vue";

//state.allContacts.filter(character => character.team === 'Avengers');


test('filtrando un array', () => {
  interface Notifications { 
    [type: string]: { 
      [from: string]: any; 
    }; 
  }
  const notif: Notifications = {};
  notif['new-message']={}
  notif['new-message']['pepe111'] = [];
  notif['new-message']['pepe111'].push({test:111})

  

  expect(notif).toEqual(
    {
      "new-message":{
        "pepe111": [
          {
            test:111
          }
        ]
      }
    }
  );
});