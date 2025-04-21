from flask import Flask, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from models import db, User, Reward, Redemption
from config import Config
import random, string
from flask_session import Session

app = Flask(__name__)
app.config.from_object(Config)
app.config['SESSION_TYPE']='filesystem'

db.init_app(app)
Session(app)
CORS(app, origins= "http://localhost:3000", supports_credentials=True)

def generateReferalCode(username):
    return username[:3].upper() +''.join(random.choices(string.digits, k=3))

@app.route('/register',methods=['GET','POST'])
def register():
    data=request.get_json()
    username=data['username']
    email=data['email']
    phone=data['phone']
    password=data['password']
    referrer_code = data.get('referral') or None

    if User.query.filter((User.email==email) or (User.phone == phone)).first():
        return jsonify({'status':'error','message':'email or phone already exists!'})
    if referrer_code:
        referrer_user=User.query.filter_by(referral_code=referrer).first()
        referrer_user.points+=10
        
    newUser=User(
        username=username,
        email=email,
        phone=phone,
        password=generate_password_hash(password),
        referred_by=referrer_code,
        referral_code=generateReferalCode(username),
        points=5 if referrer_code else 0
    )
    db.session.add(newUser)

    if data.get('referral_code'):
        referrer= User.query.filter_by(referral_code=data['referral_code']).first()
        if referrer:
            referrer.points+=10
    
    db.session.commit()
    return jsonify({'status':'success','message':'Registration Successful!'})

@app.route('/login',methods=['GET','POST'])
def login():
    data=request.get_json()
    login_id=data['email_or_phone']
    password=data['password']

    user = User.query.filter((User.email==login_id) or (User.phone==login_id)).first()
    if user and check_password_hash(user.password,password):
        session['user_id'] = user.id
        return jsonify({'status': 'success', 'message': 'Login successful'})
    else:
        return jsonify({'status': 'error', 'message': 'Invalid credentials'})

@app.route('/check-session')
def check_session():
    if 'user_id' in session:
        return jsonify({'status': 'success', 'user_id': session['user_id']})
    return jsonify({'status': 'error', 'message': 'Not logged in'})

@app.route('/dashboard', methods=['GET'])
def dashboard():
    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Unauthorized'})

    user = User.query.get(session['user_id'])
    referrals = User.query.filter_by(referred_by=user.referral_code).all()
    rewards = Reward.query.all()
    redemptions = Redemption.query.filter_by(user_id=user.id).all()

    redeemed_rewards = [Reward.query.get(r.reward_id).name for r in redemptions]

    return jsonify({
        'status': 'success',
        'user': {
            'username': user.username,
            'email': user.email,
            'phone': user.phone,
            'points': user.points,
            'referral_code': user.referral_code
        },
        'referrals': [{'username': r.username, 'email': r.email} for r in referrals],
        'rewards': [{'id': rw.id, 'name': rw.name, 'points_required': rw.points_required} for rw in rewards],
        'redemptions': redeemed_rewards
    })

@app.route('/redeem/<int:reward_id>', methods=['POST'])
def api_redeem_reward(reward_id):
    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    user = User.query.get(session['user_id'])
    reward = Reward.query.get(reward_id)

    if user.points >= reward.points_required:
        user.points -= reward.points_required
        redemption = Redemption(user_id=user.id, reward_id=reward.id)
        db.session.add(redemption)
        db.session.commit()
        message = 'Reward redeemed!'
    else:
        message = 'Not enough points.'

    return jsonify({'status': 'success', 'message': message})

@app.route('/reset-referral', methods=['POST'])
def reset_referral():
    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Unauthorized'})
    user = User.query.get(session['user_id'])
    # print(user)
    new_code = generateReferalCode(user.username)
    user.referral_code = new_code
    db.session.commit()

    return jsonify({'status': 'success', 'referral_code': new_code})

@app.route('/logout', methods=['POST'])
def api_logout():
    session.pop('user_id', None)
    return jsonify({'status': 'success', 'message': 'Logged out'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)