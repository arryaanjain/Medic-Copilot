# Mock MongoDB collection for medicines
medicines = app.db['medicines']

@app.route('/add_medicine', methods=['POST'])
def add_medicine():
    try:
        data = request.json
        logging.debug(f"Received data: {data}")

        # Check if the request is for manual entry or prescription upload
        if 'prescription' in data:
            # Handle prescription upload
            prescription_data = data['prescription']
            # Extract medicine details from the prescription (this could involve OCR processing)
            # For now, we'll assume the prescription data is already parsed into a list of medicines
            medicines_list = prescription_data.get('medicines', [])
            
            # Validate the medicines list
            if not medicines_list:
                logging.warning("No medicines found in the prescription")
                return jsonify({'error': 'No medicines found in the prescription'}), 400

            # Insert each medicine into the database
            inserted_ids = []
            for medicine in medicines_list:
                medicine['user_id'] = data.get('user_id')  # Associate medicine with the user
                medicine['added_on'] = datetime.now()
                inserted_id = medicines.insert_one(medicine).inserted_id
                inserted_ids.append(str(inserted_id))

            logging.info(f"Medicines added successfully from prescription: {inserted_ids}")
            return jsonify({
                'message': 'Medicines added successfully from prescription',
                'medicine_ids': inserted_ids
            }), 201

        else:
            # Handle manual entry
            required_fields = ('name', 'quantity', 'expiry_date', 'user_id')
            if not all(k in data for k in required_fields):
                logging.warning("Missing required fields for manual entry")
                return jsonify({'error': 'Missing required fields'}), 400

            # Create medicine document
            medicine = {
                'name': data['name'],
                'quantity': data['quantity'],
                'expiry_date': data['expiry_date'],
                'user_id': data['user_id'],
                'added_on': datetime.now()
            }
            logging.debug(f"Medicine object to insert: {medicine}")

            # Insert into MongoDB
            inserted_id = medicines.insert_one(medicine).inserted_id
            logging.info(f"Medicine added successfully with ID: {inserted_id}")

            return jsonify({
                'message': 'Medicine added successfully',
                'medicine_id': str(inserted_id)
            }), 201

    except Exception as e:
        logging.error(f"Error in /add_medicine: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

# Mock MongoDB collection for treatments
treatments = app.db['treatments']

@app.route('/add_treatment', methods=['POST'])
def add_treatment():
    try:
        data = request.json
        logging.debug(f"Received data: {data}")

        # Check for required fields
        required_fields = ('user_id', 'treatment_name', 'medicines')
        if not all(k in data for k in required_fields):
            logging.warning("Missing required fields")
            return jsonify({'error': 'Missing required fields'}), 400

        # Validate the medicines list
        medicines_list = data.get('medicines', [])
        if not medicines_list:
            logging.warning("No medicines provided in the treatment")
            return jsonify({'error': 'No medicines provided in the treatment'}), 400

        # Create treatment document
        treatment = {
            'user_id': data['user_id'],
            'treatment_name': data['treatment_name'],
            'medicines': medicines_list,
            'start_date': data.get('start_date', datetime.now()),
            'end_date': data.get('end_date'),
            'notes': data.get('notes', ''),
            'added_on': datetime.now()
        }
        logging.debug(f"Treatment object to insert: {treatment}")

        # Insert into MongoDB
        inserted_id = treatments.insert_one(treatment).inserted_id
        logging.info(f"Treatment added successfully with ID: {inserted_id}")

        return jsonify({
            'message': 'Treatment added successfully',
            'treatment_id': str(inserted_id)
        }), 201

    except Exception as e:
        logging.error(f"Error in /add_treatment: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500


@app.route('/medicine_history', methods=['POST'])
def add_medicine_history():
    try:
        data = request.json
        logging.debug(f"Received data: {data}")

        # Check for required fields
        required_fields = ('user_id', 'medicine_id')
        if not all(k in data for k in required_fields):
            logging.warning("Missing required fields")
            return jsonify({'error': 'Missing required fields'}), 400

        # Create medicine history document
        medicine_history = {
            'user_id': data['user_id'],  # Get user_id from the request
            'medicine_id': data['medicine_id'],  # Get medicine_id from the request
            'added_on': datetime.now()  # Timestamp when the history entry is added
        }
        logging.debug(f"Medicine history object to insert: {medicine_history}")

        # Insert into MongoDB
        inserted_id = medicines_history.insert_one(medicine_history).inserted_id
        logging.info(f"Medicine history added successfully with ID: {inserted_id}")

        return jsonify({
            'message': 'Medicine history added successfully',
            'history_id': str(inserted_id)
        }), 201

    except Exception as e:
        logging.error(f"Error in /medicine_history (POST): {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/medicine_history', methods=['GET'])
def get_medicine_history():
    try:
        # Get user_id from query parameters
        user_id = request.args.get('user_id')
        if not user_id:
            logging.warning("user_id is required")
            return jsonify({'error': 'user_id is required'}), 400

        # Fetch all medicine history records for the given user_id
        history_records = list(medicines_history.find({'user_id': user_id}))
        logging.debug(f"Fetched history records: {history_records}")

        # Convert ObjectId to string for JSON serialization
        for record in history_records:
            record['_id'] = str(record['_id'])

        return jsonify({
            'message': 'Medicine history fetched successfully',
            'history': history_records
        }), 200

    except Exception as e:
        logging.error(f"Error in /medicine_history (GET): {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/medicine_history', methods=['POST'])
def add_medicine_history():
    try:
        data = request.json
        logging.debug(f"Received data: {data}")

        # Check for required fields
        required_fields = ('user_id', 'medicine_id')
        if not all(k in data for k in required_fields):
            logging.warning("Missing required fields")
            return jsonify({'error': 'Missing required fields'}), 400

        # Call the switchToHistory API to set medicineActive to false
        switch_to_history_url = "https://your-api-endpoint/switchToHistory"  # Replace with the actual URL
        payload = {
            'medicine_id': data['medicine_id']
        }
        headers = {
            'Content-Type': 'application/json'
        }

        # Make the API call
        response = requests.post(switch_to_history_url, json=payload, headers=headers)
        if response.status_code != 200:
            logging.error(f"switchToHistory API failed with status code: {response.status_code}")
            return jsonify({'error': 'Failed to update medicineActive status'}), 500

        # Check if the medicineActive field was successfully set to false
        switch_to_history_response = response.json()
        if not switch_to_history_response.get('success', False):
            logging.error("switchToHistory API did not return success")
            return jsonify({'error': 'Failed to update medicineActive status'}), 500

        # Create medicine history document
        medicine_history = {
            'user_id': data['user_id'],  # Get user_id from the request
            'medicine_id': data['medicine_id'],  # Get medicine_id from the request
            'added_on': datetime.now()  # Timestamp when the history entry is added
        }
        logging.debug(f"Medicine history object to insert: {medicine_history}")

        # Insert into MongoDB
        inserted_id = medicines_history.insert_one(medicine_history).inserted_id
        logging.info(f"Medicine history added successfully with ID: {inserted_id}")

        return jsonify({
            'message': 'Medicine history added successfully',
            'history_id': str(inserted_id)
        }), 201

    except Exception as e:
        logging.error(f"Error in /medicine_history (POST): {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/switchToHistory', methods=['POST'])
def switch_to_history():
    try:
        data = request.json
        logging.debug(f"Received data: {data}")

        # Check for required fields
        required_fields = ('medicine_id',)
        if not all(k in data for k in required_fields):
            logging.warning("Missing required fields")
            return jsonify({'error': 'Missing required fields'}), 400

        # Get medicine_id from the request
        medicine_id = data['medicine_id']
        logging.debug(f"Updating medicineActive for medicine_id: {medicine_id}")

        # Update medicineActive to false in the medicines collection
        result = medicines.update_one(
            {'_id': ObjectId(medicine_id)},  # Find the medicine by its ID
            {'$set': {'medicineActive': False}}  # Set medicineActive to False
        )

        # Check if the update was successful
        if result.matched_count == 0:
            logging.warning(f"No medicine found with ID: {medicine_id}")
            return jsonify({'error': 'Medicine not found'}), 404

        if result.modified_count == 0:
            logging.warning(f"Medicine with ID {medicine_id} already has medicineActive set to False")
            return jsonify({'error': 'Medicine already inactive'}), 400

        logging.info(f"Medicine with ID {medicine_id} updated successfully: medicineActive set to False")
        return jsonify({
            'success': True,
            'message': 'medicineActive set to false',
            'medicine_id': medicine_id
        }), 200

    except Exception as e:
        logging.error(f"Error in /switchToHistory: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

if _name_ == '_main_':
    app.run(debug=True)