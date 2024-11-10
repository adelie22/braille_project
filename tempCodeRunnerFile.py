from flask import Flask, render_template, jsonify, request
from routes import register_blueprints  # Ensure this function is defined in routes/__init__.py
from db import get_db_connection  # Ensure this connects to the correct database
from word_chain.api import word_chain_api  # Import the word_chain Blueprint
