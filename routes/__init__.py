from .ko_grade1 import ko_grade1_api
from .ko_grade2 import ko_grade2_api
from .ko_voca import ko_voca_api
from .en_grade1 import en_grade1_api
from .en_grade2 import en_grade2_api
from .en_voca import en_voca_api
from .diary import diary_api 



def register_blueprints(app):
    app.register_blueprint(en_grade1_api, url_prefix='/en_grade1')
    app.register_blueprint(en_grade2_api, url_prefix='/en_grade2')
    app.register_blueprint(en_voca_api, url_prefix='/en_voca')
    app.register_blueprint(ko_grade1_api, url_prefix='/ko_grade1')
    app.register_blueprint(ko_grade2_api, url_prefix='/ko_grade2')
    app.register_blueprint(ko_voca_api, url_prefix='/ko_voca')
    app.register_blueprint(diary_api, url_prefix='/diary')
 
    
